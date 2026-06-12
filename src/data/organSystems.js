export const organSystems = [
  {
    id: 'digestive',
    name: 'Digestive System',
    tagline: 'Breaking down nutrients for life',
    description:
      'The digestive system breaks down food into nutrients that the body absorbs for energy, growth, and cell repair. It processes everything from the first bite to waste elimination.',
    
    gradient: 'from-orange-400 via-orange-500 to-red-500',
    accentColor: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    cardBg: 'from-orange-100/40 to-orange-50/30',
    borderColor: 'border-orange-300/60',
    organs: [
      { id: 'mouth',            name: 'Mouth',           description: 'Chews food and breaks it down using teeth and saliva. The first step in the digestive process.' },
      { id: 'esophagus',        name: 'Esophagus',       description: 'A muscular tube that moves food from the mouth to the stomach using wave-like contractions.' },
      { id: 'stomach',          name: 'Stomach',         description: 'Churns food and mixes it with gastric acid and enzymes to form a semi-liquid paste called chyme.' },
      { id: 'liver',            name: 'Liver',           description: 'The largest internal organ. Produces bile, processes nutrients, and filters harmful substances from blood.' },
      { id: 'gallbladder',      name: 'Gallbladder',     description: 'Stores and concentrates bile produced by the liver, releasing it to help digest fats.' },
      { id: 'pancreas',         name: 'Pancreas',        description: 'Produces digestive enzymes and insulin. Plays a dual role in digestion and blood sugar regulation.' },
      { id: 'small_intestine',  name: 'Small Intestine', description: 'The primary site of nutrient absorption. Over 6 meters long, lined with tiny villi that absorb nutrients.' },
      { id: 'large_intestine',  name: 'Large Intestine', description: 'Absorbs water and electrolytes from remaining indigestible food matter and compacts waste.' },
      { id: 'rectum',           name: 'Rectum',          description: 'The final section of the large intestine that stores feces until they are ready to be expelled.' },
      { id: 'anus',             name: 'Anus',            description: 'The opening at the end of the digestive tract through which waste material leaves the body.' },
    ],
  },
  {
    id: 'circulatory',
    name: 'Circulatory System',
    tagline: 'The river of life flowing within',
    description:
      'The circulatory system is the body\'s transport network, pumping blood through a vast network of vessels to deliver oxygen and nutrients to every cell while removing waste products.',
    
    gradient: 'from-pink-400 via-pink-500 to-rose-500',
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    cardBg: 'from-pink-100/40 to-pink-50/30',
    borderColor: 'border-pink-300/60',
    organs: [
      { id: 'heart',         name: 'Heart',         description: 'Pumps blood to all parts of the body.' },
      { id: 'blood_vessels', name: 'Blood Vessels', description: 'Tubes that transport blood throughout the body.' },
      { id: 'blood',         name: 'Blood',         description: 'it carries oxygen and nutrients to different parts of the body.' },
    ],
  },
  {
    id: 'skeletal',
    name: 'Skeletal System',
    tagline: 'The framework that holds it all together',
    description:
      'The skeletal system is the body\'s structural framework — 206 bones that support the body, protect vital organs, enable movement, and produce blood cells in bone marrow.',
    
    gradient: 'from-teal-400 via-teal-500 to-cyan-500',
    accentColor: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.3)',
    cardBg: 'from-teal-100/40 to-teal-50/30',
    borderColor: 'border-teal-300/60',
    organs: [
      { id: 'skull',      name: 'Skull',      description: 'It protects the brain from injuries.' },
      { id: 'spine',      name: 'Spine',      description: 'It allows the body to bend and move.' },
      { id: 'rib_cage',   name: 'Rib Cage',   description: 'It Protects the heart and lungs.' },
      { id: 'hand_bones', name: 'Hand Bones', description: 'Allows the body to hold, grasp, and use objects.' },
      { id: 'leg_bones',  name: 'Leg Bones',  description: 'Support body weight and help the body move.' },
    ],
  },
  {
    id: 'muscular',
    name: 'Muscular System',
    tagline: 'Power and movement in harmony',
    description:
      'The muscular system contains over 600 muscles that work in coordinated pairs to produce every movement — from blinking to running — while also generating heat and maintaining posture.',
    
    gradient: 'from-violet-400 via-violet-500 to-purple-500',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    cardBg: 'from-violet-100/40 to-violet-50/30',
    borderColor: 'border-violet-300/60',
    organs: [
      { id: 'biceps',          name: 'Biceps',         description: 'It is the muscles in the front of the upper arm that help you bend your arm and lift objects.' },
      { id: 'abdominals',      name: 'Abdominals',     description: 'It is the muscles in the stomach area that help you protect important internal organs like the stomach and intestines.' },
      { id: 'quadriceps',      name: 'Quadriceps',     description: 'It is the muscles in the front of the upper leg that help you walk, run, jump, and straighten your leg.' },
      { id: 'facial_muscles',  name: 'Facial Muscles', description: 'It is the muscles in the face that help you make facial expressions such as smiling, frowning, and blinking.' },
      { id: 'deltoid',         name: 'Deltoid',        description: 'It is the muscles in the shoulder that help you move your arm in different directions and to keep you safe when you carry things.' },
      { id: 'pectorals',       name: 'Pectorals',      description: 'It is the muscles in the chest that help you move your arms and shoulders.' },
    ],
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    tagline: 'Every breath, a gift of life',
    description:
      'The respiratory system is the body\'s gas exchange network, bringing oxygen into the blood and expelling carbon dioxide with every breath — around 20,000 times per day.',
    
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
    accentColor: '#0ea5e9',
    glowColor: 'rgba(14, 165, 233, 0.3)',
    cardBg: 'from-sky-100/40 to-sky-50/30',
    borderColor: 'border-sky-300/60',
    organs: [
      { id: 'nose',      name: 'Nose',      description: 'Allows air to enter the body and filters dust and dirt.' },
      { id: 'trachea',   name: 'Trachea',   description: 'Carries air from the nose to the lungs.' },
      { id: 'bronchi',   name: 'Bronchi',   description: 'Two large air tubes that carry air from the trachea into the left and right lungs.' },
      { id: 'lungs',     name: 'Lungs',     description: 'Absorb oxygen and remove carbon dioxide.' },
      { id: 'diaphragm', name: 'Diaphragm', description: 'Helps you breathe by moving down to let air in and moving up to push air out.' },
    ],
  },
]

export const getSystemById = (id) => organSystems.find((s) => s.id === id)
