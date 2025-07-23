
import React, { useState } from 'react';
import { generateRecipe } from '../services/geminiService';
import type { Recipe } from '../types';
import Card from '../components/ui/Card';
import { SparklesIcon } from '../components/ui/Icons';

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => (
    <Card className="animate-fade-in">
        <h2 className="text-2xl font-bold text-primary mb-2">{recipe.recipeName}</h2>
        <p className="text-text-muted mb-4">{recipe.description}</p>
        
        <div className="flex justify-around bg-base-100 p-3 rounded-lg mb-4 text-center">
            <div>
                <p className="font-bold text-lg">{recipe.calories} <span className="text-sm font-normal">kcal</span></p>
                <p className="text-xs text-text-muted">Calorías</p>
            </div>
             <div>
                <p className="font-bold text-lg">{recipe.macros.protein}</p>
                <p className="text-xs text-text-muted">Proteína</p>
            </div>
             <div>
                <p className="font-bold text-lg">{recipe.macros.carbs}</p>
                <p className="text-xs text-text-muted">Carbs</p>
            </div>
             <div>
                <p className="font-bold text-lg">{recipe.macros.fat}</p>
                <p className="text-xs text-text-muted">Grasa</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-bold text-lg mb-2">Ingredientes</h3>
                <ul className="list-disc list-inside space-y-1 text-text-base">
                    {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-lg mb-2">Instrucciones</h3>
                <ol className="list-decimal list-inside space-y-2 text-text-base">
                    {recipe.instructions.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
            </div>
        </div>
    </Card>
);


const RecipesPage: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateRecipe = async () => {
        if (!prompt) {
            setError('Por favor, escribe qué tipo de receta te gustaría.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRecipe(null);
        
        const result = await generateRecipe(prompt);

        if (result) {
            setRecipe(result);
        } else {
            setError('No se pudo generar la receta. Inténtalo de nuevo.');
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Generador de Recetas Saludables</h1>
            <p className="text-text-muted">¿Sin ideas para cocinar? Pidele a nuestra IA una receta. Prueba con "un almuerzo alto en proteína" o "una cena ligera vegetariana".</p>
            
            <Card>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe la receta que quieres..."
                        className="flex-grow p-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleGenerateRecipe}
                        disabled={isLoading}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus disabled:bg-base-300 disabled:cursor-not-allowed flex items-center"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2"/>
                        {isLoading ? 'Generando...' : 'Generar'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </Card>

            {isLoading && (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-muted">Creando una deliciosa receta para ti...</p>
                </div>
            )}
            
            {recipe && <RecipeCard recipe={recipe} />}

        </div>
    );
};

export default RecipesPage;
