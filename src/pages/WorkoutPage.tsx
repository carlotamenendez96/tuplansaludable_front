import React, { useState, useEffect, useCallback } from 'react';
import { WorkoutPlan, Workout, Exercise, WorkoutExercise, WorkoutCategory } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { CheckCircleIcon, DumbbellIcon, XCircleIcon, TrashIcon } from '../components/ui/Icons';
import { plans } from '../services/apiService';

interface WorkoutPageProps {
  userId: string;
  isTrainerContext?: boolean;
}

const emptyWorkout: Workout = { name: '', category: WorkoutCategory.STRENGTH_UPPER_1, exercises: [], estimatedDuration: 45, difficulty: 'beginner' };
const emptyExercise: Exercise = { name: '', type: 'STRENGTH', notes: '' };
const emptyWorkoutExercise: WorkoutExercise = { 
  exercise: emptyExercise, 
  sets: [{ reps: 10, restTime: 60 }] 
};

const WorkoutPage: React.FC<WorkoutPageProps> = ({ userId, isTrainerContext }) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isWorkoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Workout>(emptyWorkout);

  const [isExerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState<Exercise>(emptyExercise);
  const [targetWorkoutId, setTargetWorkoutId] = useState<string>(''); // Changed from day to id
  
  // Estado para los ejercicios del nuevo entrenamiento
  const [newWorkoutExercises, setNewWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [isNewExerciseModalOpen, setIsNewExerciseModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; workoutId: string | null }>({
    isOpen: false,
    workoutId: null
  });

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
    
    // Por ahora, solo mostraremos un mensaje ya que la nueva estructura no tiene completed
    console.log('Workout completion tracking not implemented in new structure');
  };

  const handleDeleteWorkout = (workoutId: string) => {
    // Si el ID es undefined, usar el índice del array
    const actualWorkoutId = workoutId === 'undefined' || !workoutId ? 
      workoutPlan?.workouts.findIndex(w => w._id === workoutId)?.toString() || '0' : 
      workoutId;
    
    setConfirmDelete({ isOpen: true, workoutId: actualWorkoutId });
  };

  const confirmDeleteWorkout = async () => {
    if (!workoutPlan || confirmDelete.workoutId === null) return;
    
    // Si es el último entrenamiento, solo cerrar el modal
    if (workoutPlan.workouts.length <= 1) {
      setConfirmDelete({ isOpen: false, workoutId: null });
      return;
    }
    
    // Buscar el entrenamiento a eliminar por ID o por índice
    let workoutToDelete;
    let workoutIndex = -1;
    
    // Intentar parsear como índice primero
    const indexFromId = parseInt(confirmDelete.workoutId);
    if (!isNaN(indexFromId) && indexFromId >= 0 && indexFromId < workoutPlan.workouts.length) {
      // Es un índice válido
      workoutIndex = indexFromId;
      workoutToDelete = workoutPlan.workouts[workoutIndex];
    } else {
      // Intentar buscar por ID
      workoutIndex = workoutPlan.workouts.findIndex(w => w._id === confirmDelete.workoutId);
      workoutToDelete = workoutPlan.workouts[workoutIndex];
    }
    
    if (!workoutToDelete) {
      setError('No se encontró el entrenamiento a eliminar.');
      setConfirmDelete({ isOpen: false, workoutId: null });
      return;
    }
    
    try {
      // Eliminar por índice si no hay ID válido
      const updatedWorkouts = workoutPlan.workouts.filter((_, index) => index !== workoutIndex);
      
      // Verificar que aún hay entrenamientos después del filtro
      if (updatedWorkouts.length === 0) {
        setError('No se puede eliminar el último entrenamiento del plan. Añade otro entrenamiento primero.');
        setConfirmDelete({ isOpen: false, workoutId: null });
        return;
      }
      
      const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
      setWorkoutPlan(response.data.data);
    } catch (err: any) {
      console.error('Error deleting workout:', err);
      setError(err.response?.data?.message || 'Error al eliminar el entrenamiento.');
    } finally {
      setConfirmDelete({ isOpen: false, workoutId: null });
    }
  };

  const handleAddWorkout = async () => {
    if (!workoutPlan) return;
    
    // Verificar que hay al menos un ejercicio
    if (newWorkoutExercises.length === 0) {
      setError('Debes añadir al menos un ejercicio al entrenamiento.');
      return;
    }
    
    try {
      // Crear un entrenamiento con los ejercicios añadidos
      const workoutWithExercises: Workout = {
        ...newWorkout,
        category: newWorkout.category || WorkoutCategory.STRENGTH_UPPER_1,
        exercises: newWorkoutExercises
      };

      const updatedWorkouts = [...workoutPlan.workouts, workoutWithExercises];
      const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
      setWorkoutPlan(response.data.data);
      setWorkoutModalOpen(false);
      setNewWorkoutExercises([]); // Resetear ejercicios
    } catch (err: any) {
      console.error('Error adding workout:', err);
      setError(err.response?.data?.message || 'Error al añadir sesión de entrenamiento.');
    }
  };
  
  const handleAddExercise = async () => {
      if (!workoutPlan) return;
      try {
          // Crear un WorkoutExercise con la estructura correcta
          const workoutExercise: WorkoutExercise = {
              exercise: {
                  name: newExercise.name,
                  type: newExercise.type,
                  description: `Ejercicio ${newExercise.name}`,
                  instructions: [`Realizar ${newExercise.name} correctamente`],
                  targetMuscles: ['Músculos objetivo'],
                  equipment: ['Sin equipo'],
                  difficulty: 'beginner'
              },
              sets: [
                  {
                      reps: newExercise.reps || 10,
                      duration: newExercise.duration || 30,
                      restTime: 60
                  }
              ],
              ...(newExercise.notes && newExercise.notes.trim() && { notes: newExercise.notes.trim() })
          };

          const updatedWorkouts = workoutPlan.workouts.map(w => 
              w._id === targetWorkoutId ? { ...w, exercises: [...w.exercises, workoutExercise] } : w
          );
          const response = await plans.updateWorkoutPlan(userId, { ...workoutPlan, workouts: updatedWorkouts });
          setWorkoutPlan(response.data.data);
          setExerciseModalOpen(false);
          setNewExercise(emptyExercise); // Reset form
      } catch (err: any) {
          console.error('Error adding exercise:', err);
          setError(err.response?.data?.message || 'Error al añadir ejercicio.');
      }
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
      if (!workoutPlan) return;
      
      // Verificar que no se elimine el último ejercicio
      const workout = workoutPlan.workouts.find(w => w._id === workoutId);
      if (workout && workout.exercises.length <= 1) {
          setError('No se puede eliminar el último ejercicio del entrenamiento. Añade otro ejercicio primero.');
          return;
      }

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
    setNewWorkoutExercises([]); // Resetear ejercicios del nuevo entrenamiento
    setWorkoutModalOpen(true);
  }

  const openAddExerciseModal = (workoutId: string) => {
      setTargetWorkoutId(workoutId);
      setNewExercise(emptyExercise);
      setExerciseModalOpen(true);
  }
  
  const openAddNewExerciseModal = () => {
      setNewExercise(emptyExercise);
      setIsNewExerciseModalOpen(true);
  }
  
  const handleAddNewExercise = () => {
      // Crear un WorkoutExercise con la estructura correcta
      const workoutExercise: WorkoutExercise = {
          exercise: {
              name: newExercise.name,
              type: newExercise.type,
              description: `Ejercicio ${newExercise.name}`,
              instructions: [`Realizar ${newExercise.name} correctamente`],
              targetMuscles: ['Músculos objetivo'],
              equipment: ['Sin equipo'],
              difficulty: 'beginner'
          },
          sets: [
              {
                  reps: newExercise.reps || 10,
                  duration: newExercise.duration || 30,
                  restTime: 60
              }
          ],
          ...(newExercise.notes && newExercise.notes.trim() && { notes: newExercise.notes.trim() })
      };

      setNewWorkoutExercises(prev => [...prev, workoutExercise]);
      setIsNewExerciseModalOpen(false);
      setNewExercise(emptyExercise); // Reset form
  }
  
  const handleDeleteNewExercise = (index: number) => {
      setNewWorkoutExercises(prev => prev.filter((_, i) => i !== index));
  }
  
  const handleWorkoutModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setNewWorkout(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value) : (name === 'category' ? value as WorkoutCategory : value)
      }));
  }
  
  const handleExerciseModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        {workoutPlan.workouts.map((workout, index) => (
          <Card key={workout._id} className="flex flex-col relative">
            {isEditing && (
                 <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => handleDeleteWorkout(workout._id || index.toString())} className="p-2 bg-red-100 rounded-full hover:bg-red-200"><TrashIcon className="w-4 h-4 text-red-600"/></button>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-secondary flex items-center"><DumbbellIcon className="w-6 h-6 mr-3"/>{workout.name}</h2>
                <div className="text-right">
                    <span className="font-semibold text-text-muted">{workout.estimatedDuration} min</span>
                    <div className="text-xs text-primary font-medium mt-1">
                        {workout.category === 'CARDIO' && 'Cardio'}
                        {workout.category === 'STRENGTH_UPPER_1' && 'Tren Superior 1'}
                        {workout.category === 'STRENGTH_UPPER_2' && 'Tren Superior 2'}
                        {workout.category === 'STRENGTH_LOWER_1' && 'Tren Inferior 1'}
                        {workout.category === 'STRENGTH_LOWER_2' && 'Tren Inferior 2'}
                        {workout.category === 'FLEXIBILITY' && 'Flexibilidad'}
                    </div>
                </div>
            </div>
            
            <div className="flex-1 space-y-3">
              {workout.exercises.map((workoutExercise, index) => (
                <div key={`${workout._id}-exercise-${index}-${workoutExercise.exercise.name}`} className="p-3 bg-base-100 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-text-base">{workoutExercise.exercise.name}</p>
                    <div className="flex items-center gap-x-4 text-sm text-text-muted mt-1">
                      <span>{workoutExercise.exercise.type}</span>
                      <span className="font-mono">
                        {workoutExercise.sets.length} sets
                        {workoutExercise.sets[0]?.reps && ` x ${workoutExercise.sets[0].reps} reps`}
                        {workoutExercise.sets[0]?.duration && ` x ${workoutExercise.sets[0].duration}s`}
                        {workoutExercise.sets[0]?.restTime && ` (Desc: ${workoutExercise.sets[0].restTime}s)`}
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
                    className="mt-6 w-full flex items-center justify-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    Marcar como completado
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
                    <label className="block text-sm font-medium text-text-muted">Categoría del Entrenamiento</label>
                    <select name="category" value={newWorkout.category} onChange={handleWorkoutModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" required>
                        <option value={WorkoutCategory.STRENGTH_UPPER_1}>Tren Superior 1 - Pecho/Hombros/Tríceps</option>
                        <option value={WorkoutCategory.STRENGTH_UPPER_2}>Tren Superior 2 - Espalda/Bíceps</option>
                        <option value={WorkoutCategory.STRENGTH_LOWER_1}>Tren Inferior 1 - Cuádriceps/Glúteos</option>
                        <option value={WorkoutCategory.STRENGTH_LOWER_2}>Tren Inferior 2 - Isquiotibiales/Core</option>
                        <option value={WorkoutCategory.CARDIO}>Cardio</option>
                        <option value={WorkoutCategory.FLEXIBILITY}>Flexibilidad</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Duración Estimada (minutos)</label>
                    <input type="number" name="estimatedDuration" value={newWorkout.estimatedDuration} onChange={handleWorkoutModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="45" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Nombre del Entrenamiento</label>
                    <input type="text" name="name" value={newWorkout.name} onChange={handleWorkoutModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Ej: Tren Superior" required />
                </div>
                
                {/* Sección de Ejercicios */}
                <div className="border-t border-base-200 pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-text-muted">Ejercicios del Entrenamiento</label>
                        <button 
                            type="button" 
                            onClick={openAddNewExerciseModal}
                            className="text-sm text-primary hover:text-primary-focus font-medium"
                        >
                            + Añadir Ejercicio
                        </button>
                    </div>
                    
                    {newWorkoutExercises.length === 0 ? (
                        <div className="text-center py-4 text-text-muted text-sm">
                            No hay ejercicios añadidos. Añade al menos un ejercicio.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {newWorkoutExercises.map((workoutExercise, index) => (
                                <div key={`new-exercise-${index}`} className="p-3 bg-base-100 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-text-base">{workoutExercise.exercise.name}</p>
                                        <div className="flex items-center gap-x-4 text-sm text-text-muted mt-1">
                                            <span>{workoutExercise.exercise.type}</span>
                                            <span className="font-mono">
                                                {workoutExercise.sets.length} sets
                                                {workoutExercise.sets[0]?.reps && ` x ${workoutExercise.sets[0].reps} reps`}
                                                {workoutExercise.sets[0]?.duration && ` x ${workoutExercise.sets[0].duration}s`}
                                                {workoutExercise.sets[0]?.restTime && ` (Desc: ${workoutExercise.sets[0].restTime}s)`}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteNewExercise(index)} 
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                    <select name="type" value={newExercise.type} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2">
                        <option value="STRENGTH">Fuerza</option>
                        <option value="CARDIO">Cardio</option>
                        <option value="FLEXIBILITY">Flexibilidad</option>
                        <option value="BALANCE">Equilibrio</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Repeticiones</label>
                        <input type="number" name="reps" value={newExercise.reps || 10} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="10" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Duración (segundos)</label>
                        <input type="number" name="duration" value={newExercise.duration || 30} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="30" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Notas (opcional)</label>
                    <input type="text" name="notes" value={newExercise.notes || ''} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Notas sobre el ejercicio" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setExerciseModalOpen(false)} className="bg-base-200 text-text-base font-bold py-2 px-4 rounded-lg hover:bg-base-300">Cancelar</button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">Añadir Ejercicio</button>
                </div>
            </form>
      </Modal>

      <Modal title="Añadir Ejercicio al Nuevo Entrenamiento" isOpen={isNewExerciseModalOpen} onClose={() => setIsNewExerciseModalOpen(false)}>
            <form onSubmit={(e) => { e.preventDefault(); handleAddNewExercise(); }} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Nombre del Ejercicio</label>
                    <input type="text" name="name" value={newExercise.name} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Tipo</label>
                    <select name="type" value={newExercise.type} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2">
                        <option value="STRENGTH">Fuerza</option>
                        <option value="CARDIO">Cardio</option>
                        <option value="FLEXIBILITY">Flexibilidad</option>
                        <option value="BALANCE">Equilibrio</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Repeticiones</label>
                        <input type="number" name="reps" value={newExercise.reps || 10} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="10" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Duración (segundos)</label>
                        <input type="number" name="duration" value={newExercise.duration || 30} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="30" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-muted">Notas (opcional)</label>
                    <input type="text" name="notes" value={newExercise.notes || ''} onChange={handleExerciseModalChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Notas sobre el ejercicio" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setIsNewExerciseModalOpen(false)} className="bg-base-200 text-text-base font-bold py-2 px-4 rounded-lg hover:bg-base-300">Cancelar</button>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">Añadir Ejercicio</button>
                </div>
            </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, workoutId: null })}
        onConfirm={confirmDeleteWorkout}
        title="Eliminar Entrenamiento"
        message={
          workoutPlan && workoutPlan.workouts.length <= 1
            ? "No se puede eliminar el último entrenamiento del plan. Añade otro entrenamiento primero."
            : "¿Seguro que quieres eliminar este entrenamiento? Esta acción no se puede deshacer."
        }
        confirmText={workoutPlan && workoutPlan.workouts.length <= 1 ? "Entendido" : "Eliminar"}
        cancelText="Cancelar"
        confirmButtonColor={workoutPlan && workoutPlan.workouts.length <= 1 ? "blue" : "red"}
      />

    </div>
  );
};



export default WorkoutPage;

