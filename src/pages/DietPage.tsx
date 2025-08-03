import React, { useState, useEffect, useCallback } from 'react';
import { DietPlan, Meal } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import { CheckCircleIcon, XCircleIcon, TrashIcon, DumbbellIcon } from '../components/ui/Icons';
import { plans } from '../services/apiService';

interface DietPageProps {
  userId: string;
  isTrainerContext?: boolean;
}

const emptyMeal: Meal = {
    type: 'SNACK',
    foods: [],
    totalCalories: 0,
    notes: ''
};

const DietPage: React.FC<DietPageProps> = ({ userId, isTrainerContext }) => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeal, setNewMeal] = useState<Meal>(emptyMeal);
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; mealIndex: number | null }>({
    isOpen: false,
    mealIndex: null
  });

  const fetchDietPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await plans.getDietPlan(userId);
      setDietPlan(response.data.data);
    } catch (err: any) {
      console.error('Error fetching diet plan:', err);
      setError(err.response?.data?.message || 'Error al cargar el plan de dieta.');
      setDietPlan(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDietPlan();
    setCompletedMeals(new Set()); // Reset on user change
    setIsEditing(false);
  }, [userId, fetchDietPlan]);

  const handleToggleMealCompletion = (mealName: string) => {
    if (isTrainerContext) return;
    setCompletedMeals(prev => {
        const newSet = new Set(prev);
        if (newSet.has(mealName)) {
            newSet.delete(mealName);
        } else {
            newSet.add(mealName);
        }
        return newSet;
    });
  };
  
  const openAddMealModal = () => {
      setNewMeal(emptyMeal);
      setIsModalOpen(true);
  }
  
  // Función auxiliar para calcular calorías totales de una comida
  const calculateMealCalories = (meal: Meal) => {
    return meal.foods.reduce((total, foodItem) => {
      const multiplier = foodItem.quantity / 100;
      return total + (foodItem.food.calories * multiplier);
    }, 0);
  };

  // Función auxiliar para asegurar que todas las comidas tengan totalCalories
  const ensureMealsHaveCalories = (meals: Meal[]) => {
    return meals.map(meal => ({
      ...meal,
      totalCalories: meal.totalCalories || calculateMealCalories(meal)
    }));
  };

  const handleAddMeal = async () => {
    if (!dietPlan) return;
    try {
      // Convertir la estructura del frontend a la estructura del backend
      const backendMeal = {
        type: newMeal.type as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
        foods: newMeal.foods,
        totalCalories: calculateMealCalories(newMeal),
        notes: newMeal.notes || `Comida añadida: ${newMeal.type}`
      };

      const updatedMeals = ensureMealsHaveCalories([...dietPlan.meals, backendMeal]);
      const updatedPlan = { ...dietPlan, meals: updatedMeals };
      const response = await plans.updateDietPlan(userId, updatedPlan);
      setDietPlan(response.data.data);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error adding meal:', err);
      setError(err.response?.data?.message || 'Error al añadir comida.');
    }
  };

  const handleDeleteMeal = (mealIndex: number) => {
    setConfirmDelete({ isOpen: true, mealIndex });
  };

  const confirmDeleteMeal = async () => {
    if (!dietPlan || confirmDelete.mealIndex === null) return;
    
    try {
      const updatedMeals = ensureMealsHaveCalories(dietPlan.meals.filter((_, index) => index !== confirmDelete.mealIndex));
      const updatedPlan = { ...dietPlan, meals: updatedMeals };
      const response = await plans.updateDietPlan(userId, updatedPlan);
      setDietPlan(response.data.data);
    } catch (err: any) {
      console.error('Error deleting meal:', err);
      setError(err.response?.data?.message || 'Error al eliminar comida.');
    } finally {
      setConfirmDelete({ isOpen: false, mealIndex: null });
    }
  };
  
  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'foods') {
          // Convertir el texto a la estructura de objetos
          const foodLines = value.split('\n').filter(line => line.trim());
          const foods = foodLines.map(line => {
              // Asumir formato: "100g Pollo" o "100 Pollo"
              const match = line.match(/^(\d+)(?:g)?\s+(.+)$/);
              if (match) {
                  return {
                      quantity: parseInt(match[1]),
                      food: {
                          name: match[2].trim(),
                          calories: 0,
                          protein: 0,
                          carbs: 0,
                          fat: 0
                      }
                  };
              }
              // Si no coincide el formato, crear un objeto con cantidad 100g
              return {
                  quantity: 100,
                  food: {
                      name: line.trim(),
                      calories: 0,
                      protein: 0,
                      carbs: 0,
                      fat: 0
                  }
              };
          });
          setNewMeal(prev => ({...prev, foods}));
      } else {
          setNewMeal(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleUpdatePlan = async () => {
    if (!dietPlan) return;
    try {
      const updatedPlan = { 
        ...dietPlan, 
        meals: ensureMealsHaveCalories(dietPlan.meals) 
      };
      const response = await plans.updateDietPlan(userId, updatedPlan);
      setDietPlan(response.data.data);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating diet plan:', err);
      setError(err.response?.data?.message || 'Error al actualizar el plan de dieta.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando plan de dieta...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!dietPlan) {
    return (
        <div className="text-center p-8">
            <p className="text-text-muted mb-4">No se encontró un plan de alimentación para este usuario.</p>
            {isTrainerContext && (
                <button onClick={() => setDietPlan({ userId, name: "Nuevo Plan", dailyActivity: "", supplementation: [], description: "", targetCalories: 2000, targetProtein: 150, targetCarbs: 200, targetFat: 67, meals: [], startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], notes: "" })} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">
                    Crear Plan de Dieta
                </button>
            )}
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Plan de Alimentación: <span className="text-primary">{dietPlan.name}</span></h1>
        {isTrainerContext && (
            <button onClick={() => setIsEditing(!isEditing)} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors">
                {isEditing ? 'Finalizar Edición' : 'Editar Plan'}
            </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <h3 className="text-lg font-bold mb-3 text-text-base flex items-center"><DumbbellIcon className="w-5 h-5 mr-2"/>Descripción y Fechas</h3>
            <div className="text-sm space-y-2">
                <p><strong className="text-text-base">Descripción:</strong> <span className="text-text-muted">{dietPlan.description || 'Sin descripción'}</span></p>
                <p><strong className="text-text-base">Inicio:</strong> <span className="text-text-muted">{new Date(dietPlan.startDate || '').toLocaleDateString()}</span></p>
                <p><strong className="text-text-base">Fin:</strong> <span className="text-text-muted">{new Date(dietPlan.endDate || '').toLocaleDateString()}</span></p>
                <p><strong className="text-text-base">Notas:</strong> <span className="text-text-muted">{dietPlan.notes || 'Sin notas'}</span></p>
            </div>
        </Card>
        <Card>
            <h3 className="text-lg font-bold mb-3 text-text-base">Resumen de Totales Diarios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-sm text-text-muted">Calorías</p>
                    <p className="text-2xl font-bold text-amber-500">{dietPlan.actualMacros?.calories?.toFixed(0) || '0'}</p>
                </div>
                <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-sm text-text-muted">Proteína</p>
                    <p className="text-2xl font-bold text-sky-500">{dietPlan.actualMacros?.protein?.toFixed(0) || '0'}g</p>
                </div>
                <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-sm text-text-muted">Carbs</p>
                    <p className="text-2xl font-bold text-orange-500">{dietPlan.actualMacros?.carbs?.toFixed(0) || '0'}g</p>
                </div>
                <div className="p-3 bg-base-100 rounded-lg">
                    <p className="text-sm text-text-muted">Grasa</p>
                    <p className="text-2xl font-bold text-red-500">{dietPlan.actualMacros?.fat?.toFixed(0) || '0'}g</p>
                </div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dietPlan.meals.map((meal, index) => (
          <Card key={`meal-${index}-${meal.type}`} className="flex flex-col relative">
            {isEditing && (
                 <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => handleDeleteMeal(index)} className="p-2 bg-red-100 rounded-full hover:bg-red-200"><TrashIcon className="w-4 h-4 text-red-600"/></button>
                </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg text-primary">{meal.type}</h3>
                <p className="text-sm text-text-muted">{meal.totalCalories} cal</p>
              </div>
            </div>

            <div className="my-4 space-y-2 text-sm flex-1">
              <h4 className="font-semibold">Alimentos:</h4>
              <ul className="list-disc list-inside text-text-muted">
                {meal.foods.map((foodItem, i) => (
                  <li key={`${meal.type}-food-${i}-${foodItem.food.name}`}>
                    {foodItem.quantity}g {foodItem.food.name}
                  </li>
                ))}
              </ul>
              {meal.notes && (
                <p className="text-xs text-text-muted mt-2 italic">{meal.notes}</p>
              )}
            </div>

            {!isTrainerContext && (
                <button
                onClick={() => handleToggleMealCompletion(meal.type)}
                className={`mt-4 w-full flex items-center justify-center py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
                    completedMeals.has(meal.type)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                >
                {completedMeals.has(meal.type) ? <CheckCircleIcon className="w-5 h-5 mr-2" /> : <XCircleIcon className="w-5 h-5 mr-2" />}
                {completedMeals.has(meal.type) ? 'Completada' : 'Marcar como completada'}
                </button>
            )}
          </Card>
        ))}
         {isEditing && (
                <button onClick={openAddMealModal} className="flex items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-base-300 rounded-xl hover:bg-base-100 text-text-muted transition-colors">
                    + Añadir Comida
                </button>
            )}
        {(!dietPlan.meals || dietPlan.meals.length === 0) && !isEditing && (
            <div className="col-span-full text-center py-10">
                <p className="text-text-muted">No hay comidas planificadas.</p>
            </div>
        )}
      </div>

      <Modal title="Añadir Nueva Comida" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); handleAddMeal(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-muted">Tipo de Comida</label>
                    <select name="type" value={newMeal.type} onChange={handleModalInputChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" required>
                        <option value="BREAKFAST">Desayuno</option>
                        <option value="LUNCH">Almuerzo</option>
                        <option value="DINNER">Cena</option>
                        <option value="SNACK">Snack</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-muted">Notas</label>
                    <input type="text" name="notes" value={newMeal.notes} onChange={handleModalInputChange} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Notas opcionales"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-text-muted">Alimentos (uno por línea, usa / para opciones)</label>
                <textarea name="foods" value={newMeal.foods.map(foodItem => `${foodItem.quantity}g ${foodItem.food.name}`).join('\n')} onChange={handleModalInputChange} rows={5} className="mt-1 block w-full border border-base-300 rounded-md shadow-sm p-2" placeholder="Ej: 130g Pollo\n150g Pavo\n40g Arroz"></textarea>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-base-200 text-text-base font-bold py-2 px-4 rounded-lg hover:bg-base-300">Cancelar</button>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-focus">Añadir Comida</button>
            </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, mealIndex: null })}
        onConfirm={confirmDeleteMeal}
        title="Eliminar Comida"
        message="¿Seguro que quieres eliminar esta comida? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonColor="red"
      />

    </div>
  );
};

export default DietPage;

