import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Card from '../components/ui/Card';
import { AppleIcon, BarChartIcon, DumbbellIcon } from '../components/ui/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { plans, progress, clients } from '../services/apiService';

interface DashboardPageProps {
  currentUser: User;
  isTrainerContext?: boolean;
}

const UserDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [progressLogs, setProgressLogs] = useState<any[]>([]);
    const [dietPlan, setDietPlan] = useState<any>(null);
    const [workoutPlan, setWorkoutPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [progressResponse, dietResponse, workoutResponse] = await Promise.all([
                    progress.getProgressLogs(user.id, { limit: 10, sortBy: 'date', sortOrder: 'desc' }),
                    plans.getDietPlan(user.id).catch(() => ({ data: { data: null } })),
                    plans.getWorkoutPlan(user.id).catch(() => ({ data: { data: null } }))
                ]);

                setProgressLogs(progressResponse.data.data || []);
                setDietPlan(dietResponse.data.data);
                setWorkoutPlan(workoutResponse.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.id]);

    if (loading) {
        return <div className="text-center p-8">Cargando dashboard...</div>;
    }

    const today = new Date().toLocaleDateString('en-CA', { weekday: 'long' });
    const todaysMeals = dietPlan?.meals || [];
    const todaysWorkout = workoutPlan?.workouts?.find((w: any) => w.name.toLowerCase().includes(today.toLowerCase()));

    const weightData = progressLogs.map(log => ({
        date: new Date(log.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        peso: log.weight,
    })).reverse(); // Mostrar en orden cronológico

    const latestWeight = progressLogs.length > 0 ? progressLogs[0].weight : null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Hola, {user.name?.split(' ')[0]}!</h1>
            <p className="text-lg text-text-muted">Aquí tienes un resumen de tu progreso y tus planes para hoy.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <AppleIcon className="w-5 h-5 mr-2 text-primary"/> Plan de Dieta
                    </h3>
                    {dietPlan ? (
                        <div className="text-sm text-text-muted">
                            <p className="font-semibold">{dietPlan.title}</p>
                            <p>Calorías objetivo: {dietPlan.targetCalories}</p>
                            <p>Comidas: {dietPlan.meals?.length || 0}</p>
                        </div>
                    ) : (
                        <p className="text-text-muted text-sm">No hay plan de dieta asignado.</p>
                    )}
                </Card>
                
                <Card className="bg-gradient-to-br from-sky-50 to-blue-100">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <DumbbellIcon className="w-5 h-5 mr-2 text-secondary"/> Plan de Entrenamiento
                    </h3>
                    {workoutPlan ? (
                        <div className="text-sm text-text-muted">
                            <p className="font-semibold">{workoutPlan.title}</p>
                            <p>Entrenamientos semanales: {workoutPlan.weeklyWorkouts || 0}</p>
                            <p>Duración promedio: {workoutPlan.averageWorkoutDuration || 0} min</p>
                        </div>
                    ) : (
                        <p className="text-text-muted text-sm">No hay plan de entrenamiento asignado.</p>
                    )}
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-100">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <BarChartIcon className="w-5 h-5 mr-2 text-accent"/> Último Peso Registrado
                    </h3>
                    <p className="text-3xl font-bold text-gray-800">
                        {latestWeight ? `${latestWeight} kg` : 'N/A'}
                    </p>
                    {progressLogs.length > 0 && (
                        <p className="text-sm text-text-muted mt-1">
                            {new Date(progressLogs[0].date).toLocaleDateString('es-ES')}
                        </p>
                    )}
                </Card>
            </div>

            {/* Gráfico de progreso de peso */}
            {weightData.length > 0 && (
                <Card>
                    <h3 className="font-bold text-lg mb-4">Progreso de Peso</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weightData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="peso" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Enlaces rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/diet" className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="text-center">
                            <AppleIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <h4 className="font-semibold">Ver Dieta</h4>
                        </div>
                    </Card>
                </Link>
                
                <Link to="/workout" className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="text-center">
                            <DumbbellIcon className="w-8 h-8 mx-auto mb-2 text-secondary" />
                            <h4 className="font-semibold">Ver Entrenamiento</h4>
                        </div>
                    </Card>
                </Link>
                
                <Link to="/tracking" className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="text-center">
                            <BarChartIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
                            <h4 className="font-semibold">Registrar Progreso</h4>
                        </div>
                    </Card>
                </Link>
                
                <Link to="/chat" className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">💬</span>
                            </div>
                            <h4 className="font-semibold">Chat</h4>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

const TrainerDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [clientsList, setClientsList] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainerData = async () => {
            try {
                const [clientsResponse, statsResponse] = await Promise.all([
                    clients.getClients({ limit: 10 }),
                    clients.getClientsStats().catch(() => ({ data: { data: null } }))
                ]);

                setClientsList(clientsResponse.data.data || []);
                setStats(statsResponse.data.data);
            } catch (error) {
                console.error('Error fetching trainer data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainerData();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Cargando dashboard del entrenador...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Panel del Entrenador</h1>
            <p className="text-lg text-text-muted">Gestiona a tus clientes y supervisa su progreso.</p>

            {/* Estadísticas del entrenador */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
                    <h3 className="font-bold text-lg mb-2">Total de Clientes</h3>
                    <p className="text-3xl font-bold text-gray-800">{clientsList.length}</p>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
                    <h3 className="font-bold text-lg mb-2">Clientes Activos</h3>
                    <p className="text-3xl font-bold text-gray-800">
                        {clientsList.filter(client => client.isActive !== false).length}
                    </p>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-violet-100">
                    <h3 className="font-bold text-lg mb-2">Planes Activos</h3>
                    <p className="text-3xl font-bold text-gray-800">
                        {clientsList.filter(client => client.activePlans?.diet || client.activePlans?.workout).length}
                    </p>
                </Card>
            </div>

            {/* Lista de clientes */}
            <Card>
                <h3 className="font-bold text-lg mb-4">Tus Clientes</h3>
                {clientsList.length > 0 ? (
                    <div className="space-y-3">
                        {clientsList.map(client => (
                            <Link 
                                key={client.id} 
                                to={`/client/${client.id}/dashboard`}
                                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">{client.fullName || `${client.firstName} ${client.lastName}`}</h4>
                                        <p className="text-sm text-text-muted">{client.email}</p>
                                        {client.lastProgress && (
                                            <p className="text-xs text-text-muted">
                                                Último progreso: {new Date(client.lastProgress.date).toLocaleDateString('es-ES')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {client.activePlans && (
                                            <div className="text-sm">
                                                {client.activePlans.diet && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-1">Dieta</span>}
                                                {client.activePlans.workout && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Entrenamiento</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-muted">No tienes clientes asignados aún.</p>
                )}
            </Card>
        </div>
    );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUser, isTrainerContext = false }) => {
    if (currentUser.role === UserRole.TRAINER && !isTrainerContext) {
        return <TrainerDashboard user={currentUser} />;
    } else {
        return <UserDashboard user={currentUser} />;
    }
};

export default DashboardPage;

