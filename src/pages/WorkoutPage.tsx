import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutPlan, Workout, Exercise } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { CheckCircleIcon, DumbbellIcon, XCircleIcon, TrashIcon } from '../components/ui/Icons';
import { plans } from '../services/apiService';

interface WorkoutPageProps {
  userId: string;
  isTrainerContext?: boolean;
}

const emptyWorkout: Workout = { userId: '', name: '',day: '', exercises: [], completed: false };
const emptyExercise: Exercise = { name: '', type: 'Fuerza', sets: 3, reps: '10', rest: '60s' };

const WorkoutPage: React.FC<WorkoutPageProps> = ({ userId, isTrainerContext }) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Workout>(emptyWorkout);

  const [isExerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<Exercise>(emptyExercise);
  const [targetWorkoutId, setTargetWorkoutId] = useState<string>(''); // Changed from day to id

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkoutPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await plans.getWorkoutPlan(userId);
      setWorkoutPlan(response.data.data);
    } catch (err: any) {
      console.error('Error fetching workout plan:', err);
      setError(err.response?.data?.message || 'Error al cargar el plan de entrenamiento.');
      setWorkoutPlan(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkoutPlan();
    setIsEditing(false);
  }, [userId, fetchWorkoutPlan]);

  const handleToggleWorkoutCompletion = async (workoutId: string) => {
    if (isTrainerContext || !workoutPlan) return;
    
    const updatedWorkouts = workoutPlan.workouts.map(w => 
      w._id === workoutId ? { ...w, completed: !w.completed } : w
    );
    
    try {
      const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
      setWorkoutPlan(response.data.data);
    } catch (err: any) {
      console.error('Error updating workout completion:', err);
      setError(err.response?.data?.message || 'Error al actualizar el estado del entrenamiento.');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!workoutPlan) return;
    if (!window.confirm(`¿Seguro que quieres eliminar este entrenamiento?`)) return;
    try {
      const updatedWorkouts = workoutPlan.workouts.filter(w => w._id !== workoutId);
      const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
      setWorkoutPlan(response.data.data);
    } catch (err: any) {
      console.error('Error deleting workout:', err);
      setError(err.response?.data?.message || 'Error al eliminar el entrenamiento.');
    }
  };

  const handleAddWorkout = async () => {
    if (!workoutPlan) return;
    try {
      const updatedWorkouts = [...workoutPlan.workouts, newWorkout];
      const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
      setWorkoutPlan(response.data.data);
      setWorkoutModalOpen(false);
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err.response?.data?.message || 'Error al añadir sesión de entrenamiento.');
    }
  };
  
  const handleAddExercise = async () => {
      if (!workoutPlan) return;
      try {
          const updatedWorkouts = workoutPlan.workouts.map(w => 
              w._id === targetWorkoutId ? { ...w, exercises: [...w.exercises, newExercise] } : w
          );
          const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
          setWorkoutPlan(response.data.data);
          setExerciseModalOpen(false);
      } catch (err: any) {
          console.error('Error adding exercise:', err);
          setError(err.response?.data?.message || 'Error al añadir ejercicio.');
      }
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
      if (!workoutPlan) return;
      try {
          const updatedWorkouts = workoutPlan.workouts.map(w => 
              w._id === workoutId ? { ...w, exercises: w.exercises.filter((_, i) => i !== exerciseIndex) } : w
          );
          const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
          setWorkoutPlan(response.data.data);
      } catch (err: any) {
          console.error('Error deleting exercise:', err);
          setError(err.response?.data?.message || 'Error al eliminar ejercicio.');
      }
  };

  const openAddWorkoutModal = () => {
    setNewWorkout(emptyWorkout);
    setWorkoutModalOpen(true);
  }

  const openAddExerciseModal = (workoutId: string) => {
      setTargetWorkoutId(workoutId);
      setNewExercise(emptyExercise);
      setExerciseModalOpen(true);
  }
  
  const handleWorkoutModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewWorkout(prev => ({ ...prev, [name]: value }));
  }
  
  const handleExerciseModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type } = e.target;
      setNewExercise(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
  }

  if (loading) {
    return <div className="text-center p-8">Cargando plan de entrenamiento...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!workoutPlan) {
    return (
        <div className="text-center p-8">
            <p className="text-text-muted mb-4">No se encontró un plan de entrenamiento para este usuario.</p>
            {isTrainerContext && (
                <button onClick={() => setWorkoutPlan({ userId, title: "Nuevo Plan", workouts: [], startDate: new Date().toISOString().split('T')[0], isActive: true, trainerId: "", schedule: [] })} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">
                    Crear Plan de Entrenamiento
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Plan de Entrenamiento: <span className="text-secondary">{workoutPlan.title}</span></h1>
        {isTrainerContext && (
             <button onClick={() => setIsEditing(!isEditing)} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors">
                {isEditing ? 'Finalizar Edición' : 'Editar Plan'}
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workoutPlan.workouts.map(workout => (
          <Card key={workout._id} className="flex flex-col relative">
            {isEditing && (
                 <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => handleDeleteWorkout(workout._id!)} className="p-2 bg-red-100 rounded-full hover:bg-red-200"><TrashIcon className="w-4 h-4 text-red-600"/></button>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-secondary flex items-center"><DumbbellIcon className="w-6 h-6 mr-3"/>{workout.name}</h2>
                <span className="font-semibold text-text-muted">{workout.day}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="p-3 bg-base-100 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-base">{exercise.name}</p>
                    <div className="flex items-center gap-x-4 text-sm text-text-muted mt-1">
                      <span>{exercise.type}</span>
                      <span className="font-mono">
                        {exercise.sets && `${exercise.sets}x`}
                        {exercise.reps || exercise.duration}
                        {exercise.rest && ` (Desc: ${exercise.rest})`}
                      </span>
                    </div>
                  </div>
                  {isEditing && (
                    <button onClick={() => handleDeleteExercise(workout._id!, index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
               {isEditing && (
                    <button onClick={() => openAddExerciseModal(workout._id!)} className="w-full text-center mt-2 py-2 text-sm text-primary hover:bg-primary/10 rounded-md">
                        + Añadir Ejercicio
                    </button>
                )}
            </div>

            {!isTrainerContext && (
                <button
                    onClick={() => handleToggleWorkoutCompletion(workout._id!)}
                    className={`mt-6 w-full flex items-center justify-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                        workout.completed
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {workout.completed ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
                    {workout.completed ? 'Completado' : 'Marcar como completado'}
                </button>
            )}
          </Card>
        ))}
         {isEditing && (
            <button onClick={openAddWorkoutModal} className="flex items-center justify-center w-full min-h-[200px] border-2 border-dashed border-base-300 rounded-xl hover:bg-base-100 text-text-muted transition-colors">
                + Añadir Sesión de Entrenamiento
            </button>
        )}
      </div>

       <Modal title="Añadir Sesión de Entrenamiento" isOpen={isWorkoutModalOpen} onClose={() => setWorkoutModalOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); handleAddWorkout(); }} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Día de la Semana</label>
                    <select name="day" value={newWorkout.day} onChange={handleWorkoutModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Nombre del Entrenamiento</label>
                    <input type="text" name="name" value={newWorkout.name} onChange={handleWorkoutModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Ej: Tren Superior" required />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setWorkoutModalOpen(false)} className="bg-base-200 text-text-base font-bold py-2 px-4 rounded-lg hover:bg-base-300">Cancelar</button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">Añadir Sesión</button>
                </div>
            </form>
      </Modal>

      <Modal title={`Añadir Ejercicio a ${workoutPlan?.workouts.find(w => w._id === targetWorkoutId)?.name || 'este entrenamiento'}`} isOpen={isExerciseModalOpen} onClose={() => setExerciseModalOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); handleAddExercise(); }} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Nombre del Ejercicio</label>
                    <input type="text" name="name" value={newExercise.name} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Tipo</label>
                    <input type="text" name="type" value={newExercise.type} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Fuerza, Cardio, etc." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Sets</label>
                        <input type="number" name="sets" value={newExercise.sets} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Reps/Duración</label>
                        <input type="text" name="reps" value={newExercise.reps} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="10 / 30s" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-muted">Descanso</label>
                        <input type="text" name="rest" value={newExercise.rest} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="60s" />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setExerciseModalOpen(false)} className="bg-base-200 text-text-base font-bold py-2 px-4 rounded-lg hover:bg-base-300">Cancelar</button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">Añadir Ejercicio</button>
                </div>
            </form>
      </Modal>

    </div>
  );
};



export default WorkoutPage;

