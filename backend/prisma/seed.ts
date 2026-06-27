import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@2026!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@nissi-communication.com' },
    update: {},
    create: {
      email: 'admin@nissi-communication.com',
      password: hash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Super Admin créé :', superAdmin.email);

  // ── Services ─────────────────────────────────────────────────────────
  await prisma.service.deleteMany({});
  await prisma.service.createMany({
    data: [
      {
        title: 'Conseil',
        description: "Stratégies visionnaires pour naviguer dans la complexité du marché. Nous anticipons les tendances avant qu'elles n'émergent.",
        icon: 'lightbulb',
        order: 1,
      },
      {
        title: 'Media Veille',
        description: "Surveillance omnisciente des flux d'information. Détection précoce des signaux faibles pour une réactivité absolue.",
        icon: 'radar',
        order: 2,
      },
      {
        title: 'Event',
        description: "Création d'expériences physiques immersives et mémorables. Des rassemblements qui marquent les esprits et forgent l'histoire.",
        icon: 'celebration',
        order: 3,
      },
      {
        title: 'Branding',
        description: "Forgeage d'identités visuelles radicales. Nous sculptons l'essence de votre marque pour qu'elle résonne avec une force magnétique inégalée.",
        icon: 'style',
        order: 4,
      },
      {
        title: 'Gadgeterie',
        description: "Conception d'objets promotionnels singuliers. Des artefacts tangibles qui prolongent l'expérience de marque dans le réel.",
        icon: 'redeem',
        order: 5,
      },
      {
        title: 'Digital',
        description: "Développement d'écosystèmes numériques immersifs. De l'architecture web aux interfaces envoûtantes, nous codons le futur de votre présence en ligne.",
        icon: 'computer',
        order: 6,
      },
    ],
  });

  // ── Contenu pages ─────────────────────────────────────────────────────

  // Hero (inclut les chiffres clés affichés en bas de la section)
  await prisma.pageContent.upsert({
    where:  { section: 'hero' },
    update: {
      data: {
        title:        'Les esprits de la com',
        description:  "Cabinet de conseil en stratégie de marque et en influence, NISSI Communication accompagne les organisations dans la structuration, le pilotage et le déploiement de leur visibilité. Nous transformons les enjeux de communication en leviers de croissance, de positionnement et d'autorité.",
        tagline:      'Invoquez les Esprits et prenez le pouvoir !',
        stat1_number: '50+',  stat1_label:  'Projets réalisés',
        stat2_number: '30+',  stat2_label:  'Clients satisfaits',
        stat3_number: '5+',   stat3_label:  "Années d'expérience",
        stat4_number: '100%', stat4_label:  'Engagement client',
      },
    },
    create: {
      section: 'hero',
      data: {
        title:        'Les esprits de la com',
        description:  "Cabinet de conseil en stratégie de marque et en influence, NISSI Communication accompagne les organisations dans la structuration, le pilotage et le déploiement de leur visibilité. Nous transformons les enjeux de communication en leviers de croissance, de positionnement et d'autorité.",
        tagline:      'Invoquez les Esprits et prenez le pouvoir !',
        stat1_number: '50+',  stat1_label:  'Projets réalisés',
        stat2_number: '30+',  stat2_label:  'Clients satisfaits',
        stat3_number: '5+',   stat3_label:  "Années d'expérience",
        stat4_number: '100%', stat4_label:  'Engagement client',
      },
    },
  });

  // Suppression de la section 'about' (chiffres migrés dans hero)
  await prisma.pageContent.deleteMany({ where: { section: 'about' } });

  // CTA
  await prisma.pageContent.upsert({
    where: { section: 'cta' },
    update: {},
    create: {
      section: 'cta',
      data: {
        title:      'Prêt à invoquer votre image ?',
        subtitle:   'Travaillons ensemble à la structuration et au rayonnement de votre marque.',
        buttonText: 'INVOQUEZ-NOUS',
      },
    },
  });

  // Projets (carousel)
  await prisma.pageContent.upsert({
    where: { section: 'projets' },
    update: {},
    create: {
      section: 'projets',
      data: {
        title: 'Création',
      },
    },
  });

  console.log('Seed terminé avec succès');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
