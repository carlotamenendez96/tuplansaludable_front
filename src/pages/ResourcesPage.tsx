
import React, { useState } from 'react';
import Card from '../components/ui/Card';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, setIsOpen }) => (
  <div className="border-b border-base-200">
    <h2>
      <button
        type="button"
        className="flex items-center justify-between w-full p-5 font-medium text-left text-text-base hover:bg-base-100"
        onClick={setIsOpen}
      >
        <span>{title}</span>
        <svg className={`w-6 h-6 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </h2>
    <div className={`${isOpen ? 'block' : 'hidden'} p-5 border-t border-base-200`}>
      <div className="prose max-w-none text-text-muted">
        {children}
      </div>
    </div>
  </div>
);

const ResourcesPage: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>('dieta');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const resources = [
    {
      id: 'dieta',
      title: '¿Qué es una "Dieta"?',
      content: (
        <>
          <p>El término "dieta" se refiere al conjunto de hábitos alimenticios de una persona o población. No significa necesariamente restricción. Una dieta puede ser saludable o no saludable.</p>
          <p>Coloquialmente, usamos "dieta" para describir un régimen alimenticio con un fin específico, como bajar o subir de peso, mejorar la salud o potenciar el rendimiento deportivo. El objetivo es crear un patrón de alimentación sostenible y placentero a largo plazo.</p>
        </>
      ),
    },
    {
      id: 'macros',
      title: 'Macronutrientes y Micronutrientes',
      content: (
        <>
          <h4>Macronutrientes (los que necesitamos en grandes cantidades):</h4>
          <ul>
            <li><strong>Proteínas:</strong> Fundamentales para construir y reparar tejidos, músculos y huesos. Fuentes: pollo, carne, pescado, huevos, legumbres, tofu.</li>
            <li><strong>Carbohidratos:</strong> Nuestra principal fuente de energía. Es clave elegir carbohidratos complejos. Fuentes: arroz integral, quinua, avena, tubérculos, frutas y verduras.</li>
            <li><strong>Grasas:</strong> Esenciales para la producción de hormonas y la absorción de vitaminas. Prioriza las grasas insaturadas. Fuentes: aguacate, frutos secos, semillas, aceite de oliva.</li>
          </ul>
          <h4>Micronutrientes (vitaminas y minerales):</h4>
          <p>Son vitales para innumerables procesos corporales, desde la función inmunológica hasta la producción de energía. Se encuentran en una dieta variada rica en frutas, verduras, y alimentos integrales.</p>
        </>
      ),
    },
    {
      id: 'ejercicio',
      title: 'Beneficios del Ejercicio Físico',
      content: (
        <>
          <p>El ejercicio físico va más allá de quemar calorías. Sus beneficios son integrales:</p>
          <ul>
            <li><strong>Acelera el metabolismo:</strong> Ayuda a que tu cuerpo use la energía de manera más eficiente.</li>
            <li><strong>Mejora la salud cardiovascular:</strong> Fortalece el corazón y mejora la circulación.</li>
            <li><strong>Fortalece músculos y huesos:</strong> Previene la sarcopenia y la osteoporosis.</li>
            <li><strong>Impacto en la salud mental:</strong> Reduce el estrés, la ansiedad y mejora el estado de ánimo al liberar endorfinas.</li>
          </ul>
        </>
      ),
    },
     {
      id: 'hidratacion',
      title: 'La Importancia de la Hidratación',
      content: (
        <p>
            Beber suficiente agua es crucial para casi todas las funciones del cuerpo. Ayuda a regular la temperatura corporal, transportar nutrientes, eliminar desechos y mantener la energía. No esperes a tener sed para beber; la sed ya es un signo de deshidratación.
        </p>
      ),
    },
    {
      id: 'intuitive',
      title: 'Alimentación Intuitiva (Opcional)',
      content: (
        <>
          <p>La alimentación intuitiva es un enfoque que te enseña a crear una relación saludable con la comida y tu cuerpo. Se basa en confiar en tus señales internas de hambre y saciedad.</p>
          <h4>Principios clave:</h4>
          <ul>
            <li><strong>Honrar tu hambre:</strong> Come cuando tu cuerpo te pida energía.</li>
            <li><strong>Hacer las paces con la comida:</strong> Permítete comer todos los alimentos sin culpas.</li>
            <li><strong>Descubrir la satisfacción:</strong> Disfruta de la experiencia de comer.</li>
            <li><strong>Sentir tu plenitud:</strong> Aprende a reconocer cuándo estás cómodamente satisfecho.</li>
          </ul>
          <p>El objetivo no es la pérdida de peso, sino cultivar el bienestar. A veces, comer por placer, convivencia o para gestionar emociones es normal y parte de una vida equilibrada.</p>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Recursos de Bienestar</h1>
      <p className="text-text-muted">Empodérate con conocimiento para tomar las mejores decisiones para tu salud.</p>
      <Card className="p-0">
        {resources.map((item) => (
          <AccordionItem
            key={item.id}
            title={item.title}
            isOpen={openAccordion === item.id}
            setIsOpen={() => toggleAccordion(item.id)}
          >
            {item.content}
          </AccordionItem>
        ))}
      </Card>
    </div>
  );
};

export default ResourcesPage;
