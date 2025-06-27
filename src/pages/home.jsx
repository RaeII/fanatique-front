import { Trophy, Star, Award, Users, Ticket, Coffee, Timer, CreditCard, ShoppingBag, ChevronRight, Check, Smartphone } from 'lucide-react'
import { WalletConnect } from '../components/wallet-connect'
import { Button } from '../components/ui-v2/Button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react';
import { useWalletContext } from '../hooks/useWalletContext';


export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(['home', 'common']);

  const handleGetStarted = () => {
    navigate('/');
  };

  const { 
    isAuthenticated, 
    isInitialized, 
    account, 
    checkWalletExists, 
    requestSignature,
    connecting,
    signing
  } = useWalletContext();

  // Verificar se o usuário já está autenticado e redirecionar para dashboard
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Efeito para verificar se o usuário já tem carteira conectada, está cadastrado, 
  // mas não está autenticado (não tem token)
  useEffect(() => {
    const checkAndRequestSignature = async () => {
      // Se temos conta conectada mas não estamos autenticados
      if (isInitialized && account && !isAuthenticated && !connecting && !signing) {
        // Verificar se a carteira já está cadastrada
        const walletCheck = await checkWalletExists();
        
        if (walletCheck?.success && walletCheck?.exists) {
          // Solicitar assinatura automaticamente
          await requestSignature();
        }
      }
    };
    
    checkAndRequestSignature();
  }, [isInitialized, account, isAuthenticated, connecting, signing, checkWalletExists, requestSignature]);

  


  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="bg-backg text-white py-16 md:py-24 imageBackground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                {t('home:hero.title')} <span className="text-primary">{t('common:app.name')}</span>
              </h1>
{/*               <p className="text-lg md:text-xl mb-8">
                {t('home:hero.subtitle')}
              </p> */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  text={t('home:hero.getStartedButton')}
                  icon={<ChevronRight size={16} />}
                />
              
              </div>
            </div>
{/*             <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-secondary/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-secondary p-2 rounded-full">
                      <Trophy className='text-foreground' size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{t('home:quests.title')}</h3>
                      <p className="text-sm">{t('home:quests.subtitle')}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    {[
                      t('home:quests.examples.stadium'), 
                      t('home:quests.examples.share'), 
                      t('home:quests.examples.purchase')
                    ].map((quest, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/30 p-3 rounded-lg">
                        <div className="bg-tertiary/70 p-1.5 rounded-full">
                          <Check size={16} className="text-foreground" />
                        </div>
                        <span className="text-sm">{quest}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="absolute -right-4 -bottom-4 bg-background p-4 rounded-xl shadow-lg max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket size={20} className="text-foreground" />
                    <span className="font-bold">{t('home:fanTokens.title')}</span>
                  </div>
                  <div className="text-sm text-text-adaptive">
                    {t('home:fanTokens.description')}
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Transition between hero and features */}
      <div className="relative h-32 md:h-40 bg-backg">
        {/* Wave overlay */}
        <svg className="absolute bottom-0 left-0 w-full" 
          viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L48 108C96 96 192 72 288 60C384 48 480 48 576 54C672 60 768 72 864 78C960 84 1056 84 1152 72C1248 60 1344 36 1392 24L1440 12V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
          fill="background" className="dark:fill-background" />
        </svg>
        
        {/* Floating bubbles/dots animation */}
        <div className="absolute top-8 left-1/4 w-6 h-6 rounded-full bg-secondary/30 animate-float-slow"></div>
        <div className="absolute top-16 left-1/3 w-4 h-4 rounded-full bg-white/20 animate-float-medium"></div>
        <div className="absolute top-4 left-2/3 w-8 h-8 rounded-full bg-secondary/20 animate-float-fast"></div>
        <div className="absolute top-20 left-3/4 w-5 h-5 rounded-full bg-white/30 animate-float-medium"></div>
        
        {/* Center icon: trophy with glow */}
        <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl transform scale-150 animate-pulse-slow"></div>
           
              <img src="/logo_green.png" alt="Fanatique" style={{
                width: "5rem",
              }} />
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 relative">
        {/* Background elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-secondary/30 text-secondary rounded-full text-sm font-semibold mb-3">{t('home:features.badge')}</span>
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white mb-3">
              {t('home:features.title')}
            </h2>
            <p className="text-lg max-w-2xl mx-auto">
              {t('home:features.subtitle')}
            </p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Center line with pulsing dots */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-secondary to-primary/20 transform -translate-x-1/2"></div>
            
            {/* Pulsing dots on timeline */}
            <div className="absolute left-1/2 top-0 w-4 h-4 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute left-1/2 top-1/6 w-4 h-4 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{top: '16.6%'}}></div>
            <div className="absolute left-1/2 top-1/3 w-4 h-4 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{top: '33.3%'}}></div>
            <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{top: '50%'}}></div>
            <div className="absolute left-1/2 top-2/3 w-4 h-4 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{top: '67.7%'}}></div>
            <div className="absolute left-1/2 top-5/6 w-4 h-4 bg-secondary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{top: '84.6%'}}></div>
            
            {/* Features in staggered layout */}
            <div className="space-y-27">
              <FeatureRow 
                icon={<ShoppingBag size={27} className="text-primary" />}
                title={t('home:features.items.shopping.title')}
                description={t('home:features.items.shopping.description')}
                details={[
                  t('home:features.items.shopping.details.0'),
                  t('home:features.items.shopping.details.1'),
                  t('home:features.items.shopping.details.2')
                ]}
                position="left"
                delay={0}
                number="01"
              />
              <FeatureRow 
                icon={<Check size={27} className="text-primary" />}
                title={t('home:features.items.checkin.title')}
                description={t('home:features.items.checkin.description')}
                details={[
                  t('home:features.items.checkin.details.0'),
                  t('home:features.items.checkin.details.1'),
                  t('home:features.items.checkin.details.2')
                ]}
                position="right"
                delay={0.3}
                number="02"
              />
              <FeatureRow 
                icon={<Trophy size={27} className="text-primary" />}
                title={t('home:features.items.quests.title')}
                description={t('home:features.items.quests.description')}
                details={[
                  t('home:features.items.quests.details.0'),
                  t('home:features.items.quests.details.1'),
                  t('home:features.items.quests.details.2')
                ]}
                position="left"
                delay={0.6}
                number="03"
              />
              <FeatureRow 
                icon={<Smartphone size={27} className="text-primary" />}
                title={t('home:features.items.tokens.title')}
                description={t('home:features.items.tokens.description')}
                details={[
                  t('home:features.items.tokens.details.0'),
                  t('home:features.items.tokens.details.1'),
                  t('home:features.items.tokens.details.2')
                ]}
                position="right"
                delay={0.9}
                number="04"
              />
              <FeatureRow 
                icon={<Award size={28} className="text-primary" />}
                title={t('home:features.items.vip.title')}
                description={t('home:features.items.vip.description')}
                details={[
                  t('home:features.items.vip.details.0'),
                  t('home:features.items.vip.details.1'),
                  t('home:features.items.vip.details.2')
                ]}
                position="left"
                delay={1.2}
                number="05"
              />
              <FeatureRow 
                icon={<Users size={28} className="text-primary" />}
                title={t('home:features.items.community.title')}
                description={t('home:features.items.community.description')}
                details={[
                  t('home:features.items.community.details.0'),
                  t('home:features.items.community.details.1'),
                  t('home:features.items.community.details.2')
                ]}
                position="right"
                delay={1.5}
                number="06"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Transition between Features and CTA */}
      <div className="relative h-24 md:h-32 -mt-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5 dark:from-background dark:to-primary/20"></div>
        
        {/* Wave overlay */}
        <svg className="absolute bottom-0 left-0 w-full" 
          viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L48 102C96 84 192 48 288 36C384 24 480 36 576 42C672 48 768 48 864 60C960 72 1056 96 1152 96C1248 96 1344 72 1392 60L1440 48V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" 
          fill="rgba(var(--primary), 0.05)" className="dark:fill-[rgba(var(--primary),0.2)]" />
        </svg>
        
        {/* Floating elements */}
        <div className="absolute top-6 left-1/3 w-3 h-3 rounded-full bg-secondary/20 animate-float-fast"></div>
        <div className="absolute top-12 left-2/3 w-4 h-4 rounded-full bg-primary/20 animate-float-medium"></div>
      </div>

      {/* CTA Section */}
      <section className="bg-primary/80 dark:bg-primary/20 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-secondary rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden backdrop-blur-sm border border-white/10"
            style={{
              border: "1px solid rgb(33 125 6 / 30%))"
            }}
          >
            {/* Gradiente de fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 dark:from-primary/10 dark:via-transparent dark:to-purple-700/20"></div>
            
            {/* Círculo decorativo */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
              <div className="mb-6 md:mb-0 md:w-2/3">
                <h2 className="text-2xl md:text-3xl font-bold text-text-adaptive dark:text-white mb-4">
                  {t('home:cta.title')}
                </h2>
                <p className="text-text-adaptive">
                  {t('home:cta.description')}
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                text={t('home:cta.button')}
                icon={<ChevronRight size={16} className="ml-2" />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer with styled background */}
      <footer className="py-8 bg-primary/80 dark:bg-primary/20 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Ticket size={20} className="text-text-adaptive" />
              <span className="font-bold text-lg">{t('common:app.name')}</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-text-adaptive/70 dark:text-white/70">&copy; {new Date().getFullYear()} {t('common:app.name')} - {t('home:footer.rights')}</p>
              <p className="mt-1 text-text-adaptive/60 dark:text-white/60">{t('home:footer.chiliz')}</p>
              
              <div className="mt-4 flex items-center justify-center md:justify-end gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center hover:bg-secondary/20 transition-colors cursor-pointer">
                  <Trophy size={16} className="text-text-adaptive" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center hover:bg-secondary/20 transition-colors cursor-pointer">
                  <Star size={16} className="text-text-adaptive" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center hover:bg-secondary/20 transition-colors cursor-pointer">
                  <Award size={16} className="text-text-adaptive" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureRow({ icon, title, description, details, position, delay, number }) {
  return (
    <div className="relative grid grid-cols-5 md:grid-cols-5 mb-16 md:mb-0">
      {/* Connector to center line - visível apenas em desktop */}
      <div className="absolute left-1/2 top-1/2 w-10 h-1 bg-secondary transform -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
      
      {/* Card content based on position */}
      {position === 'left' ? (
        <>
          <div className="col-span-5 md:col-span-2 animate-fadeInLeft" style={{ animationDelay: `${delay}s` }}>
            <div className="bg-black p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-primary/5 dark:border-white/5 transform hover:-translate-y-2 group relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-secondary/10 group-hover:bg-secondary/10 transition-all duration-500"></div>
              
              {/* Number indicator */}
              <div className="absolute top-4 right-4 font-bold text-4xl text-secondary/40 group-hover:text-secondary/20 transition-all duration-500">
                {number}
              </div>
              
              <div className="p-3 rounded-full icon text-primary w-fit mb-4 relative z-10">
                {icon}
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">{title}</h3>
              <p className="mb-5 relative z-10">{description}</p>
              
              {/* Feature details bullets */}
              <ul className="space-y-2 relative z-10">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="hidden md:block md:col-span-1"></div>
          <div className="hidden md:block md:col-span-2"></div>
        </>
      ) : (
        <>
          <div className="hidden md:block md:col-span-2"></div>
          <div className="hidden md:block md:col-span-1"></div>
          <div className="col-span-5 md:col-span-2 animate-fadeInRight" style={{ animationDelay: `${delay}s` }}>
            <div className="bg-black p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 border border-primary/5 dark:border-white/5 transform hover:-translate-y-2 group relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-secondary/10 group-hover:bg-secondary/10 transition-all duration-500"></div>
              
              {/* Number indicator */}
              <div className="absolute top-4 right-4 font-bold text-4xl text-secondary/40 group-hover:text-secondary/20 transition-all duration-500">
                {number}
              </div>
              
              <div className="p-3 rounded-full icon text-primary w-fit mb-4 relative z-10">
                {icon}
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-3 relative z-10">{title}</h3>
              <p className="text-text-adaptive mb-5 relative z-10">{description}</p>
              
              {/* Feature details bullets */}
              <ul className="space-y-2 relative z-10">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-tertiary p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-primary/5 dark:border-white/5">
      <div className="p-3 rounded-full bg-secondary/40 dark:bg-primary/20 w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-primary dark:text-white mb-3">{title}</h3>
      <p className="text-primary/70 dark:text-white/70">{description}</p>
    </div>
  );
}
