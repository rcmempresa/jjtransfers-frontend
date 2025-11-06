import React from 'react';
import { ShieldCheck, Clock, MapPin, Users, Star, Award, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage'; 

// --- Membros da Equipa 
const teamMembers = [
  { name: 'Jaime Carvalho', roleKey: 'team.role1', img: '/assets/team/pedro.jpg' },
  { name: 'Pai Jaime Carvalho', roleKey: 'team.role2', img: '/assets/team/mariana.jpg' },
  // Adicione mais membros aqui se necessário
];

// --- Componente da Galeria da Madeira (Com caminhos de imagem corrigidos)
const MadeiraGallery: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  const accentColor = 'text-amber-400';

  return (
    <section className="py-16 md:py-24 bg-gray-900/50 border-y border-gray-700">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-4xl font-bold text-center text-white mb-4">
          {t('about.galleryTitle')}
        </h2>
        <p className={`text-center text-xl ${accentColor} font-semibold mb-10`}>
          {t('about.galleryCaption')}
        </p>
        
        {/* Grade de Imagens (Ajustada para 6 imagens) */}
        <div className="grid grid-cols-4 md:grid-cols-12 gap-4">
          {/* Imagem 1 (Principal - 2x largura, 2x altura) */}
          <div className="col-span-4 md:col-span-6 row-span-2 overflow-hidden rounded-xl shadow-2xl transition-shadow duration-300">
            <img
              src="/assets/madeira_imagem_1.jpg" 
              alt="Vista panorâmica do Funchal, Madeira"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 min-h-[300px]"
            />
          </div>
          {/* Imagem 2 */}
          <div className="col-span-4 md:col-span-6 overflow-hidden rounded-xl shadow-lg">
            <img
              src="/assets/madeira_imagem_2.jpg"
              alt="Ponta de São Lourenço, Madeira"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 min-h-[200px]"
            />
          </div>
          {/* Imagem 3 */}
          <div className="col-span-4 md:col-span-6 lg:col-span-3 overflow-hidden rounded-xl shadow-lg">
            <img
              src="/assets/madeira_imagem_3.jpeg"
              alt="Levada Walk, Madeira"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 min-h-[200px]"
            />
          </div>
          {/* Imagem 4 */}
          <div className="col-span-4 md:col-span-6 lg:col-span-3 overflow-hidden rounded-xl shadow-lg">
            <img
              src="/assets/madeira_imagem_4.jpeg"
              alt="Paisagem da Madeira"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 min-h-[200px]"
            />
          </div>
          {/* Imagem 5 (Ajuste no layout para manter a simetria com 6 imagens) */}
          <div className="col-span-4 md:col-span-6 lg:col-span-6 overflow-hidden rounded-xl shadow-lg">
            <img
              src="/assets/madeira_imagem_5.jpg"
              alt="Montanhas da Madeira"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 min-h-[200px]"
            />
          </div>
          {/* Imagem 6 */}
          <div className="col-span-4 md:col-span-6 lg:col-span-6 overflow-hidden rounded-xl shadow-lg">
            <img
              src="/assets/madeira_imagem_6.jpeg"
              alt="Jardins do Funchal"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500 min-h-[200px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};


// --- Componente Principal About
const About: React.FC = () => {
  const { t } = useLanguage();

  const primaryPillars = [
    {
      icon: ShieldCheck,
      titleKey: 'pillars.title1',
      descriptionKey: 'pillars.desc1',
    },
    {
      icon: Clock,
      titleKey: 'pillars.title2',
      descriptionKey: 'pillars.desc2',
    },
    {
      icon: Users,
      titleKey: 'pillars.title3',
      descriptionKey: 'pillars.desc3',
    },
    {
      icon: MapPin,
      titleKey: 'pillars.title5', // Conhecimento Local
      descriptionKey: 'pillars.desc5', 
    },
  ];

  const accentColor = 'text-amber-400';

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 text-white">
      <div className="container mx-auto px-4">
        
        {/* Hero & Missão (Focado no Luxo Madeirense) */}
        <section className="text-center py-20 mb-16 bg-gray-800 rounded-xl shadow-2xl border-t-4 border-amber-500">
          <h1 className={`text-sm font-semibold uppercase ${accentColor} mb-2`}>
            {t('about.subtitle')}
          </h1>
          <h2 className="text-5xl font-extrabold text-white mb-6">
            {t('about.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-10">
            {t('about.missionStatement')}
          </p>
          <div className="inline-flex items-center space-x-4 text-lg font-medium text-gray-400">
            <MapPin className="w-6 h-6 text-red-600" />
            <span>{t('about.tagline')}</span>
          </div>
        </section>

        {/* Nossa História e Vantagem Competitiva (Focado na Ilha) */}
        <section className="grid lg:grid-cols-2 gap-12 items-center py-16">
          <div className="lg:pr-8">
            <h3 className={`text-sm font-semibold uppercase ${accentColor} mb-2`}>
              {t('about.advantageSubtitle')}
            </h3>
            <h2 className="text-4xl font-bold text-white mt-2 mb-6">
              {t('about.storyTitle')}
            </h2>
            <div className="space-y-4 text-gray-400">
              <p>{t('about.storyPara1')}</p>
              <p>{t('about.storyPara2')}</p>
              <p>{t('about.storyPara3')}</p>
              
              <Link to="/booking"> 
                <button className={`mt-4 px-6 py-3 rounded-full font-bold transition-all bg-amber-500 text-gray-900 hover:bg-amber-400`}>
                  {t('about.contactButton')}
                </button>
              </Link>
            </div>
          </div>
          <div>
            <img
              src="/src/assets/madeira_imagem_2.jpg"
              alt="Viagem de Luxo na Madeira"
              className="rounded-lg shadow-2xl w-full h-96 object-cover"
            />
          </div>
        </section>
        
        {/* INTEGRAÇÃO DA GALERIA DA MADEIRA */}
        <MadeiraGallery t={t} />

        {/* Pilares de Serviço (4 Colunas) */}
        <section className="py-16 border-t border-gray-700">
          <div className="text-center mb-12">
            <h3 className={`text-sm font-semibold uppercase ${accentColor} mb-2`}>
              {t('about.promiseSubtitle')}
            </h3>
            <h2 className="text-4xl font-bold text-white mt-2">
              {t('about.promiseTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {primaryPillars.map((pillar, index) => {
              const IconComponent = pillar.icon;
              return (
                <div key={index} className="p-6 bg-gray-800 rounded-lg shadow-xl transition-all border border-gray-700 hover:border-amber-500">
                  <IconComponent className={`w-10 h-10 ${accentColor} mb-4`} />
                  <h4 className="text-xl font-bold text-white mb-3">
                    {t(pillar.titleKey)}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {t(pillar.descriptionKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
        
        {/* Credibilidade (Certificações e Equipa) */}
        <section className="py-16 border-t border-gray-700">
            {/* Certificações e Credenciais */}
            <div className="text-center mb-16">
                <h3 className={`text-sm font-semibold uppercase ${accentColor} mb-2`}>
                    {t('about.credibilitySubtitle')}
                </h3>
                <h2 className="text-4xl font-bold text-white mt-2 mb-10">
                    {t('about.certificationsTitle')}
                </h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="p-4 rounded-lg bg-gray-800">
                        <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-white">{t('certification.title3')}</h4>
                        <p className="text-sm text-gray-500">{t('certification.desc3')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-800">
                        <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-white">{t('certification.title1')}</h4>
                        <p className="text-sm text-gray-500">{t('certification.desc1')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-800">
                        <Briefcase className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-white">{t('certification.title4')}</h4> 
                        <p className="text-sm text-gray-500">{t('certification.desc4')}</p> 
                    </div>
                </div>
            </div>

            {/* Secção Equipa (Com Centralização) */}
            <div className="text-center mt-20">
                <h3 className={`text-sm font-semibold uppercase ${accentColor} mb-2`}>
                    {t('about.teamSubtitle')}
                </h3>
                <h2 className="text-3xl font-bold text-white mb-10">
                    {t('about.meetTeamTitle')}
                </h2>
                
                {/* FLEXBOX para centralizar perfeitamente os membros */}
                <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto"> 
                    {teamMembers.map((member, index) => (
                        <div key={index} className="w-full sm:w-1/3 md:w-1/4 lg:w-1/5 max-w-[200px] text-center">
                            <img 
                                src={member.img}
                                alt={member.name}
                                className="w-24 h-24 object-cover rounded-full shadow-lg mb-3 mx-auto border-2 border-amber-500"
                            />
                            <p className="text-lg font-semibold text-white">{member.name}</p>
                            <p className={`text-sm ${accentColor}`}>{t(member.roleKey)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Final */}
        <section className="text-center py-16 bg-amber-500/10 rounded-lg my-12">
            <h2 className="text-3xl font-bold text-white mb-4">{t('cta.title')}</h2>
            <p className="text-xl text-gray-300 mb-8">{t('cta.subtitle')}</p>
            <Link to="/contact"> 
                <button className="px-8 py-3 bg-amber-500 text-gray-900 font-bold rounded-full shadow-lg hover:bg-amber-400 transition-colors">
                    {t('cta.button')}
                </button>
            </Link>
        </section>

      </div>
    </div>
  );
};

export default About;