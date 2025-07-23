import { User, UserRole, DietPlan, WorkoutPlan, ProgressLog, ChatMessage } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-carlota',
    name: 'Carlota Rodriguez',
    email: 'carlota@email.com',
    role: UserRole.USER,
    trainerId: 'trainer-juan',
  },
  {
    id: 'trainer-juan',
    name: 'Juan Entrenador',
    email: 'entrenador@email.com',
    role: UserRole.TRAINER,
    clients: ['user-carlota', 'user-pedro'],
  },
  {
    id: 'user-pedro',
    name: 'Pedro Martinez',
    email: 'pedro@email.com',
    role: UserRole.USER,
    trainerId: 'trainer-juan',
  }
];

export const MOCK_DIET_PLANS: { [userId: string]: DietPlan } = {
  'user-carlota': {
    targetCalories: 1530,
    targetProtein: 123,
    targetCarbs: 155,
    targetFat: 53,
    userId: 'user-carlota',
    name: 'FASE A',
    dailyActivity: '12.000 PASOS + 4 DIAS GIMNASIO',
    supplementation: [
      { name: 'CREATINA', dose: '6g (1g por cada 10kg de peso)' },
      { name: 'CAFEINA', dose: '200MG en la mañana' },
    ],
    totals: {
      calories: 1530,
      protein: 123,
      carbs: 155,
      fat: 53,
    },
    meals: [
      {
        name: 'DESAYUNO',
        time: '09:00',
        foods: [
          '30g de Avena sin gluten / o maiz olas de canela y manzana / 40g de pan',
          '40g de arandanos congelados',
          '2 huevos enteros + 100ml de claras de huevo',
        ],
      },
      {
        name: 'MEDIA MAÑANA',
        time: '11:30',
        foods: [
          '100g arandanos, o frambuesa + 10g de nueces',
          '200g de yogur griego sin lactosa 2% grasa',
        ],
      },
      {
        name: 'COMIDA',
        time: '14:00',
        foods: [
          '130gr pollo / 110gr Pavo / 260g de pescados blancos , gambas, pulpo, rejo',
          '40g de arroz',
          '150g zanahoria cocida o calabazin salteado con 5 ml de aceite de oliva',
        ],
      },
      {
        name: 'MERIENDA',
        time: '17:30',
        foods: [
          '2 huevos talla M / 100g yogurt griego natural / 120g de pechuga de pavo',
          '3 tortitas de arroz',
        ],
      },
      {
        name: 'CENA',
        time: '21:00',
        foods: [
          'Ensalada grande con vegetales variados',
          '200g de pescado blanco / 150g pollo',
          '1 cucharada de aceite de oliva',
        ],
      }
    ]
  },
  'user-pedro': {
    targetCalories: 2800,
    targetProtein: 180,
    targetCarbs: 350,
    targetFat: 75,
    userId: 'user-pedro',
    name: 'VOLUMEN 1',
    dailyActivity: '5 DÍAS GIMNASIO',
    supplementation: [
       { name: 'CREATINA', dose: '8g' },
    ],
    totals: {
      calories: 2800,
      protein: 180,
      carbs: 350,
      fat: 75,
    },
    meals: [
       {
        name: 'COMIDA 1',
        time: '08:00',
        foods: ['250ml claras + 2 yemas', '100g avena'],
      },
      {
        name: 'COMIDA 2',
        time: '12:00',
        foods: ['200g pollo / pavo', '150g arroz / pasta'],
      },
      {
        name: 'COMIDA 3',
        time: '16:00',
        foods: ['200g ternera', '150g patata cocida'],
      },
    ]
  },
};

export const MOCK_WORKOUT_PLANS: { [userId: string]: WorkoutPlan } = {
  'user-carlota': {
    userId: 'user-carlota',
    workouts: [
      { userId: 'user-carlota', day: 'Monday', name: 'Tren Superior (Fuerza)', completed: true, exercises: [
          { name: 'Press de banca', type: 'Fuerza', sets: 4, reps: '8-10', rest: '60s' },
          { name: 'Remo con barra', type: 'Fuerza', sets: 4, reps: '8-10', rest: '60s' },
          { name: 'Press militar', type: 'Fuerza', sets: 3, reps: '10-12', rest: '60s' },
        ],
      },
      { userId: 'user-carlota', day: 'Wednesday', name: 'Tren Inferior (Fuerza)', completed: false, exercises: [
          { name: 'Sentadillas', type: 'Fuerza', sets: 4, reps: '8-10', rest: '90s' },
          { name: 'Peso muerto rumano', type: 'Fuerza', sets: 4, reps: '10-12', rest: '90s' },
          { name: 'Zancadas', type: 'Fuerza', sets: 3, reps: '12 por pierna', rest: '60s' },
        ],
      },
      { userId: 'user-carlota', day: 'Friday', name: 'Cardio y Core', completed: false, exercises: [
          { name: 'Correr en cinta', type: 'Cardio', duration: '30 min' },
          { name: 'Plancha', type: 'Core', sets: 4, duration: '45s', rest: '30s' },
          { name: 'Elevación de piernas', type: 'Core', sets: 3, reps: '15', rest: '30s' },
        ],
      },
    ],
    trainerId: 'trainer-juan',
    title: 'Plan de entrenamiento ejemplo',
    schedule: [],
    startDate: new Date().toISOString().split('T')[0],
    isActive: true
  },
  'user-pedro': {
      userId: 'user-pedro',
      workouts: [
          // Basic plan for Pedro
        ],
      trainerId: 'trainer-juan',
      title: 'Plan de entrenamiento ejemplo',
      schedule: [],
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
  }
};

export const MOCK_PROGRESS_LOGS: { [userId: string]: ProgressLog[] } = {
  'user-carlota': [
    { date: '2024-05-01', weight: 65, measurements: { waist: 75, hip: 98, thigh: 55, biceps: 28 }, sensations: 'Me sentí con mucha energía esta semana.', dietCompliance: 8, photos: { front: 'https://picsum.photos/seed/a/300/400', side: 'https://picsum.photos/seed/b/300/400', back: 'https://picsum.photos/seed/c/300/400' } },
    { date: '2024-05-08', weight: 64.5, measurements: { waist: 74, hip: 97, thigh: 54.5, biceps: 28 }, sensations: 'Un poco cansada pero bien.', dietCompliance: 7, photos: { front: 'https://picsum.photos/seed/d/300/400', side: 'https://picsum.photos/seed/e/300/400', back: 'https://picsum.photos/seed/f/300/400' } },
    { date: '2024-05-15', weight: 64, measurements: { waist: 73, hip: 96, thigh: 54, biceps: 28.5 }, sensations: '¡Genial! Los entrenamientos fueron duros pero satisfactorios.', dietCompliance: 9, photos: { front: 'https://picsum.photos/seed/g/300/400', side: 'https://picsum.photos/seed/h/300/400', back: 'https://picsum.photos/seed/i/300/400' } },
    { date: '2024-05-22', weight: 63.8, measurements: { waist: 72.5, hip: 96, thigh: 53.5, biceps: 29 }, sensations: 'Semana de mucho trabajo, costó seguir el plan al 100%.', dietCompliance: 6, photos: { front: 'https://picsum.photos/seed/j/300/400', side: 'https://picsum.photos/seed/k/300/400', back: 'https://picsum.photos/seed/l/300/400' } },
  ],
  'user-pedro': [
      { date: '2024-05-15', weight: 82, sensations: 'Primera semana, todo bien.', dietCompliance: 9, photos: { front: 'https://picsum.photos/seed/m/300/400', side: 'https://picsum.photos/seed/n/300/400', back: 'https://picsum.photos/seed/o/300/400' } },
  ]
};

export const MOCK_CHAT_HISTORY: { [chatId: string]: ChatMessage[] } = {
  'user-carlota_trainer-juan': [
    { id: '1', senderId: 'user-carlota', receiverId: 'trainer-juan', text: 'Hola Juan! ¿Puedo cambiar el salmón por merluza en la cena del lunes?', timestamp: '2024-05-20T10:00:00Z' },
    { id: '2', senderId: 'trainer-juan', receiverId: 'user-carlota', text: 'Hola Carlota! Claro, sin problema. La merluza es una excelente opción también.', timestamp: '2024-05-20T10:05:00Z' },
  ]
};