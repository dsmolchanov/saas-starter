-- ============================================
-- SEED DATA FOR SPIRITUAL CONTENT
-- Multilingual support for EN, RU, ES
-- ============================================

-- Clear existing data (for fresh seeding)
DELETE FROM quote_interactions;
DELETE FROM daily_quotes;
DELETE FROM yoga_quotes;
DELETE FROM yoga_texts;
DELETE FROM moon_practice_guidelines;
DELETE FROM moon_calendar;
DELETE FROM moon_phases;
DELETE FROM chakra_daily_focus;
DELETE FROM chakra_rotation_patterns;
DELETE FROM chakras;

-- ============================================
-- CHAKRAS SEED DATA
-- ============================================

INSERT INTO chakras (
  number, sanskrit_name, color_hex, mantra, frequency_hz,
  name_en, name_ru, name_es,
  element_en, element_ru, element_es,
  location_en, location_ru, location_es,
  description_en, description_ru, description_es,
  healing_focus_en, healing_focus_ru, healing_focus_es,
  affirmation_en, affirmation_ru, affirmation_es,
  blocked_symptoms_en, blocked_symptoms_ru, blocked_symptoms_es,
  balanced_qualities_en, balanced_qualities_ru, balanced_qualities_es,
  yoga_poses, 
  crystals_en, crystals_ru, crystals_es,
  essential_oils_en, essential_oils_ru, essential_oils_es,
  foods_en, foods_ru, foods_es
) VALUES
-- Root Chakra
(
  1, 'Muladhara', '#DC2626', 'LAM', 396,
  'Root Chakra', 'Корневая чакра', 'Chakra Raíz',
  'Earth', 'Земля', 'Tierra',
  'Base of spine', 'Основание позвоночника', 'Base de la columna',
  'The foundation of our being, representing safety, security, and basic needs', 
  'Основа нашего существа, представляющая безопасность, защищенность и базовые потребности',
  'La base de nuestro ser, representa seguridad, protección y necesidades básicas',
  'Grounding, stability, physical health', 'Заземление, стабильность, физическое здоровье', 'Conexión a tierra, estabilidad, salud física',
  'I am safe, secure, and grounded', 'Я в безопасности, защищен и заземлен', 'Estoy seguro, protegido y conectado a tierra',
  '["Fear", "Anxiety", "Insecurity", "Financial worries", "Lower back pain"]',
  '["Страх", "Тревога", "Неуверенность", "Финансовые переживания", "Боль в пояснице"]',
  '["Miedo", "Ansiedad", "Inseguridad", "Preocupaciones financieras", "Dolor lumbar"]',
  '["Grounded", "Secure", "Stable", "Present", "Abundant"]',
  '["Заземленный", "Защищенный", "Стабильный", "Присутствующий", "Изобильный"]',
  '["Conectado", "Seguro", "Estable", "Presente", "Abundante"]',
  '["Mountain Pose", "Warrior I", "Tree Pose", "Child''s Pose", "Bridge Pose"]',
  '["Red Jasper", "Black Tourmaline", "Hematite", "Smoky Quartz"]',
  '["Красная яшма", "Черный турмалин", "Гематит", "Дымчатый кварц"]',
  '["Jaspe Rojo", "Turmalina Negra", "Hematita", "Cuarzo Ahumado"]',
  '["Cedarwood", "Patchouli", "Vetiver", "Sandalwood"]',
  '["Кедр", "Пачули", "Ветивер", "Сандал"]',
  '["Cedro", "Pachulí", "Vetiver", "Sándalo"]',
  '["Root vegetables", "Red foods", "Protein-rich foods", "Spices"]',
  '["Корнеплоды", "Красные продукты", "Белковая пища", "Специи"]',
  '["Verduras de raíz", "Alimentos rojos", "Alimentos ricos en proteínas", "Especias"]'
),
-- Sacral Chakra
(
  2, 'Svadhisthana', '#EA580C', 'VAM', 417,
  'Sacral Chakra', 'Сакральная чакра', 'Chakra Sacro',
  'Water', 'Вода', 'Agua',
  'Below navel', 'Ниже пупка', 'Debajo del ombligo',
  'Center of creativity, sexuality, and emotional expression',
  'Центр творчества, сексуальности и эмоционального выражения',
  'Centro de creatividad, sexualidad y expresión emocional',
  'Creativity, pleasure, emotional balance', 'Творчество, удовольствие, эмоциональный баланс', 'Creatividad, placer, equilibrio emocional',
  'I embrace pleasure and abundance', 'Я принимаю удовольствие и изобилие', 'Abrazo el placer y la abundancia',
  '["Emotional instability", "Creative blocks", "Guilt", "Sexual dysfunction"]',
  '["Эмоциональная нестабильность", "Творческие блоки", "Вина", "Сексуальная дисфункция"]',
  '["Inestabilidad emocional", "Bloqueos creativos", "Culpa", "Disfunción sexual"]',
  '["Creative", "Passionate", "Joyful", "Flexible", "Sensual"]',
  '["Творческий", "Страстный", "Радостный", "Гибкий", "Чувственный"]',
  '["Creativo", "Apasionado", "Alegre", "Flexible", "Sensual"]',
  '["Hip Openers", "Goddess Pose", "Bound Angle", "Pigeon Pose", "Cobra"]',
  '["Carnelian", "Orange Calcite", "Tiger''s Eye", "Moonstone"]',
  '["Сердолик", "Оранжевый кальцит", "Тигровый глаз", "Лунный камень"]',
  '["Cornalina", "Calcita Naranja", "Ojo de Tigre", "Piedra Luna"]',
  '["Orange", "Ylang Ylang", "Jasmine", "Rose"]',
  '["Апельсин", "Иланг-иланг", "Жасмин", "Роза"]',
  '["Naranja", "Ylang Ylang", "Jazmín", "Rosa"]',
  '["Orange foods", "Tropical fruits", "Nuts", "Seeds", "Water"]',
  '["Оранжевые продукты", "Тропические фрукты", "Орехи", "Семена", "Вода"]',
  '["Alimentos naranjas", "Frutas tropicales", "Nueces", "Semillas", "Agua"]'
),
-- Solar Plexus Chakra
(
  3, 'Manipura', '#EAB308', 'RAM', 528,
  'Solar Plexus Chakra', 'Чакра солнечного сплетения', 'Chakra Plexo Solar',
  'Fire', 'Огонь', 'Fuego',
  'Upper abdomen', 'Верхняя часть живота', 'Abdomen superior',
  'Seat of personal power, confidence, and self-esteem',
  'Место личной силы, уверенности и самооценки',
  'Sede del poder personal, confianza y autoestima',
  'Personal power, confidence, transformation', 'Личная сила, уверенность, трансформация', 'Poder personal, confianza, transformación',
  'I am strong and confident', 'Я сильный и уверенный', 'Soy fuerte y seguro',
  '["Low self-esteem", "Control issues", "Digestive problems", "Anger"]',
  '["Низкая самооценка", "Проблемы контроля", "Проблемы пищеварения", "Гнев"]',
  '["Baja autoestima", "Problemas de control", "Problemas digestivos", "Ira"]',
  '["Confident", "Empowered", "Motivated", "Responsible", "Decisive"]',
  '["Уверенный", "Наделенный силой", "Мотивированный", "Ответственный", "Решительный"]',
  '["Seguro", "Empoderado", "Motivado", "Responsable", "Decisivo"]',
  '["Boat Pose", "Warrior III", "Plank", "Twists", "Sun Salutations"]',
  '["Citrine", "Yellow Jasper", "Pyrite", "Golden Topaz"]',
  '["Цитрин", "Желтая яшма", "Пирит", "Золотой топаз"]',
  '["Citrino", "Jaspe Amarillo", "Pirita", "Topacio Dorado"]',
  '["Lemon", "Ginger", "Peppermint", "Chamomile"]',
  '["Лимон", "Имбирь", "Перечная мята", "Ромашка"]',
  '["Limón", "Jengibre", "Menta", "Manzanilla"]',
  '["Yellow foods", "Whole grains", "Bananas", "Corn", "Ginger"]',
  '["Желтые продукты", "Цельнозерновые", "Бананы", "Кукуруза", "Имбирь"]',
  '["Alimentos amarillos", "Granos enteros", "Plátanos", "Maíz", "Jengibre"]'
),
-- Heart Chakra
(
  4, 'Anahata', '#22C55E', 'YAM', 639,
  'Heart Chakra', 'Сердечная чакра', 'Chakra Corazón',
  'Air', 'Воздух', 'Aire',
  'Center of chest', 'Центр груди', 'Centro del pecho',
  'Bridge between lower and upper chakras, center of love and compassion',
  'Мост между нижними и верхними чакрами, центр любви и сострадания',
  'Puente entre chakras inferiores y superiores, centro de amor y compasión',
  'Love, compassion, forgiveness', 'Любовь, сострадание, прощение', 'Amor, compasión, perdón',
  'I am open to love', 'Я открыт любви', 'Estoy abierto al amor',
  '["Loneliness", "Jealousy", "Codependency", "Heart problems", "Trust issues"]',
  '["Одиночество", "Ревность", "Созависимость", "Проблемы с сердцем", "Проблемы доверия"]',
  '["Soledad", "Celos", "Codependencia", "Problemas cardíacos", "Problemas de confianza"]',
  '["Loving", "Compassionate", "Peaceful", "Forgiving", "Accepting"]',
  '["Любящий", "Сострадательный", "Мирный", "Прощающий", "Принимающий"]',
  '["Amoroso", "Compasivo", "Pacífico", "Perdonador", "Aceptante"]',
  '["Camel Pose", "Cobra", "Fish Pose", "Bridge", "Chest Openers"]',
  '["Rose Quartz", "Green Aventurine", "Rhodonite", "Malachite"]',
  '["Розовый кварц", "Зеленый авантюрин", "Родонит", "Малахит"]',
  '["Cuarzo Rosa", "Aventurina Verde", "Rodonita", "Malaquita"]',
  '["Rose", "Lavender", "Geranium", "Eucalyptus"]',
  '["Роза", "Лаванда", "Герань", "Эвкалипт"]',
  '["Rosa", "Lavanda", "Geranio", "Eucalipto"]',
  '["Green vegetables", "Green tea", "Raw foods", "Herbs"]',
  '["Зеленые овощи", "Зеленый чай", "Сырые продукты", "Травы"]',
  '["Verduras verdes", "Té verde", "Alimentos crudos", "Hierbas"]'
),
-- Throat Chakra
(
  5, 'Vishuddha', '#3B82F6', 'HAM', 741,
  'Throat Chakra', 'Горловая чакра', 'Chakra Garganta',
  'Ether', 'Эфир', 'Éter',
  'Throat', 'Горло', 'Garganta',
  'Center of communication, self-expression, and truth',
  'Центр коммуникации, самовыражения и истины',
  'Centro de comunicación, autoexpresión y verdad',
  'Communication, truth, authentic expression', 'Коммуникация, истина, аутентичное выражение', 'Comunicación, verdad, expresión auténtica',
  'I speak my truth', 'Я говорю свою правду', 'Hablo mi verdad',
  '["Communication issues", "Shyness", "Throat problems", "Dishonesty"]',
  '["Проблемы общения", "Застенчивость", "Проблемы с горлом", "Нечестность"]',
  '["Problemas de comunicación", "Timidez", "Problemas de garganta", "Deshonestidad"]',
  '["Expressive", "Honest", "Clear", "Good listener", "Creative"]',
  '["Выразительный", "Честный", "Ясный", "Хороший слушатель", "Творческий"]',
  '["Expresivo", "Honesto", "Claro", "Buen oyente", "Creativo"]',
  '["Shoulder Stand", "Plow Pose", "Fish Pose", "Neck Rolls", "Lion''s Breath"]',
  '["Lapis Lazuli", "Aquamarine", "Blue Lace Agate", "Turquoise"]',
  '["Лазурит", "Аквамарин", "Голубой кружевной агат", "Бирюза"]',
  '["Lapislázuli", "Aguamarina", "Ágata Azul", "Turquesa"]',
  '["Chamomile", "Peppermint", "Sage", "Eucalyptus"]',
  '["Ромашка", "Перечная мята", "Шалфей", "Эвкалипт"]',
  '["Manzanilla", "Menta", "Salvia", "Eucalipto"]',
  '["Blueberries", "Fruits", "Herbal teas", "Water"]',
  '["Черника", "Фрукты", "Травяные чаи", "Вода"]',
  '["Arándanos", "Frutas", "Tés herbales", "Agua"]'
),
-- Third Eye Chakra
(
  6, 'Ajna', '#6366F1', 'OM', 852,
  'Third Eye Chakra', 'Чакра третьего глаза', 'Chakra Tercer Ojo',
  'Light', 'Свет', 'Luz',
  'Between eyebrows', 'Между бровями', 'Entre las cejas',
  'Center of intuition, wisdom, and inner vision',
  'Центр интуиции, мудрости и внутреннего видения',
  'Centro de intuición, sabiduría y visión interior',
  'Intuition, wisdom, imagination', 'Интуиция, мудрость, воображение', 'Intuición, sabiduría, imaginación',
  'I trust my intuition', 'Я доверяю своей интуиции', 'Confío en mi intuición',
  '["Confusion", "Lack of clarity", "Headaches", "Nightmares", "Delusion"]',
  '["Путаница", "Отсутствие ясности", "Головные боли", "Кошмары", "Заблуждение"]',
  '["Confusión", "Falta de claridad", "Dolores de cabeza", "Pesadillas", "Delirio"]',
  '["Intuitive", "Perceptive", "Imaginative", "Clear", "Wise"]',
  '["Интуитивный", "Проницательный", "Изобретательный", "Ясный", "Мудрый"]',
  '["Intuitivo", "Perceptivo", "Imaginativo", "Claro", "Sabio"]',
  '["Child''s Pose", "Forward Fold", "Eagle Pose", "Meditation", "Dolphin Pose"]',
  '["Amethyst", "Purple Fluorite", "Sodalite", "Clear Quartz"]',
  '["Аметист", "Фиолетовый флюорит", "Содалит", "Прозрачный кварц"]',
  '["Amatista", "Fluorita Púrpura", "Sodalita", "Cuarzo Transparente"]',
  '["Frankincense", "Sandalwood", "Juniper", "Clary Sage"]',
  '["Ладан", "Сандал", "Можжевельник", "Мускатный шалфей"]',
  '["Incienso", "Sándalo", "Enebro", "Salvia Esclarea"]',
  '["Purple foods", "Dark chocolate", "Omega-3 rich foods", "Berries"]',
  '["Фиолетовые продукты", "Темный шоколад", "Продукты богатые омега-3", "Ягоды"]',
  '["Alimentos púrpuras", "Chocolate negro", "Alimentos ricos en omega-3", "Bayas"]'
),
-- Crown Chakra
(
  7, 'Sahasrara', '#9333EA', 'AH', 963,
  'Crown Chakra', 'Коронная чакра', 'Chakra Corona',
  'Consciousness', 'Сознание', 'Consciencia',
  'Top of head', 'Макушка головы', 'Parte superior de la cabeza',
  'Connection to divine consciousness and spiritual enlightenment',
  'Связь с божественным сознанием и духовным просветлением',
  'Conexión con la consciencia divina y la iluminación espiritual',
  'Spiritual connection, enlightenment, unity', 'Духовная связь, просветление, единство', 'Conexión espiritual, iluminación, unidad',
  'I am connected to the divine', 'Я связан с божественным', 'Estoy conectado con lo divino',
  '["Disconnection", "Spiritual crisis", "Depression", "Lack of purpose"]',
  '["Отключение", "Духовный кризис", "Депрессия", "Отсутствие цели"]',
  '["Desconexión", "Crisis espiritual", "Depresión", "Falta de propósito"]',
  '["Connected", "Aware", "Wise", "Peaceful", "Blissful"]',
  '["Связанный", "Осознанный", "Мудрый", "Мирный", "Блаженный"]',
  '["Conectado", "Consciente", "Sabio", "Pacífico", "Dichoso"]',
  '["Headstand", "Lotus Pose", "Meditation", "Corpse Pose", "Tree Pose"]',
  '["Clear Quartz", "Selenite", "Diamond", "White Calcite"]',
  '["Прозрачный кварц", "Селенит", "Алмаз", "Белый кальцит"]',
  '["Cuarzo Transparente", "Selenita", "Diamante", "Calcita Blanca"]',
  '["Lavender", "Frankincense", "Myrrh", "Lotus"]',
  '["Лаванда", "Ладан", "Мирра", "Лотос"]',
  '["Lavanda", "Incienso", "Mirra", "Loto"]',
  '["Fasting", "Pure water", "Light foods", "Violet foods"]',
  '["Голодание", "Чистая вода", "Легкая пища", "Фиолетовые продукты"]',
  '["Ayuno", "Agua pura", "Alimentos ligeros", "Alimentos violetas"]'
);

-- ============================================
-- MOON PHASES SEED DATA
-- ============================================

INSERT INTO moon_phases (
  phase_value, emoji,
  name_en, name_ru, name_es,
  energy_type_en, energy_type_ru, energy_type_es,
  description_en, description_ru, description_es,
  yoga_focus_en, yoga_focus_ru, yoga_focus_es,
  meditation_guidance_en, meditation_guidance_ru, meditation_guidance_es,
  ritual_suggestions_en, ritual_suggestions_ru, ritual_suggestions_es,
  affirmations_en, affirmations_ru, affirmations_es,
  crystals_en, crystals_ru, crystals_es,
  avoid_activities_en, avoid_activities_ru, avoid_activities_es,
  journal_prompts_en, journal_prompts_ru, journal_prompts_es
) VALUES
-- New Moon
(
  0.00, '🌑',
  'New Moon', 'Новолуние', 'Luna Nueva',
  'Setting Intentions', 'Установка намерений', 'Establecer Intenciones',
  'A time of new beginnings and planting seeds for the future',
  'Время новых начинаний и посева семян на будущее',
  'Tiempo de nuevos comienzos y sembrar semillas para el futuro',
  'Gentle, restorative practices. Focus on grounding and intention setting',
  'Мягкие, восстановительные практики. Фокус на заземлении и установке намерений',
  'Prácticas suaves y restauradoras. Enfoque en conexión a tierra e intenciones',
  'Sit in stillness and connect with your deepest desires. What do you wish to manifest?',
  'Сидите в тишине и соединитесь со своими глубочайшими желаниями. Что вы хотите проявить?',
  'Siéntate en quietud y conecta con tus deseos más profundos. ¿Qué deseas manifestar?',
  '["Write intentions", "Light candles", "Plant seeds", "Clean space", "Take ritual bath"]',
  '["Записать намерения", "Зажечь свечи", "Посадить семена", "Очистить пространство", "Принять ритуальную ванну"]',
  '["Escribir intenciones", "Encender velas", "Plantar semillas", "Limpiar espacio", "Baño ritual"]',
  '["I welcome new beginnings", "I plant seeds of intention", "I trust the process"]',
  '["Я приветствую новые начинания", "Я сажаю семена намерений", "Я доверяю процессу"]',
  '["Doy la bienvenida a nuevos comienzos", "Planto semillas de intención", "Confío en el proceso"]',
  '["Black Obsidian", "Labradorite", "Clear Quartz", "Moonstone"]',
  '["Черный обсидиан", "Лабрадорит", "Прозрачный кварц", "Лунный камень"]',
  '["Obsidiana Negra", "Labradorita", "Cuarzo Transparente", "Piedra Luna"]',
  '["Major decisions", "Launching projects", "Intense physical activity"]',
  '["Важные решения", "Запуск проектов", "Интенсивная физическая активность"]',
  '["Decisiones importantes", "Lanzar proyectos", "Actividad física intensa"]',
  '["What do I want to create?", "What patterns need to be released?", "What are my deepest intentions?"]',
  '["Что я хочу создать?", "Какие паттерны нужно отпустить?", "Каковы мои глубочайшие намерения?"]',
  '["¿Qué quiero crear?", "¿Qué patrones necesito liberar?", "¿Cuáles son mis intenciones más profundas?"]'
),
-- Waxing Crescent
(
  0.12, '🌒',
  'Waxing Crescent', 'Растущий полумесяц', 'Luna Creciente',
  'Taking Action', 'Принятие действий', 'Tomar Acción',
  'Time to take the first steps toward your intentions',
  'Время сделать первые шаги к вашим намерениям',
  'Tiempo de dar los primeros pasos hacia tus intenciones',
  'Building practices, gentle vinyasa, focus on growth and expansion',
  'Строительные практики, мягкая виньяса, фокус на росте и расширении',
  'Prácticas de construcción, vinyasa suave, enfoque en crecimiento y expansión',
  'Visualize your goals growing like the moon. Feel the energy building within you',
  'Визуализируйте, как ваши цели растут, как луна. Почувствуйте, как энергия растет внутри вас',
  'Visualiza tus metas creciendo como la luna. Siente la energía creciendo dentro de ti',
  '["Create vision board", "Start new habits", "Network and connect", "Plan actions"]',
  '["Создать доску визуализации", "Начать новые привычки", "Налаживать связи", "Планировать действия"]',
  '["Crear tablero de visión", "Comenzar nuevos hábitos", "Conectar con otros", "Planificar acciones"]',
  '["I take inspired action", "I am growing stronger", "My dreams are manifesting"]',
  '["Я предпринимаю вдохновленные действия", "Я становлюсь сильнее", "Мои мечты проявляются"]',
  '["Tomo acción inspirada", "Me vuelvo más fuerte", "Mis sueños se manifiestan"]',
  '["Green Aventurine", "Citrine", "Carnelian", "Tiger''s Eye"]',
  '["Зеленый авантюрин", "Цитрин", "Сердолик", "Тигровый глаз"]',
  '["Aventurina Verde", "Citrino", "Cornalina", "Ojo de Tigre"]',
  '["Giving up", "Doubting yourself", "Rushing the process"]',
  '["Сдаваться", "Сомневаться в себе", "Торопить процесс"]',
  '["Rendirse", "Dudar de ti mismo", "Apresurar el proceso"]',
  '["What small steps can I take today?", "How can I nurture my growth?", "What support do I need?"]',
  '["Какие маленькие шаги я могу сделать сегодня?", "Как я могу питать свой рост?", "Какая поддержка мне нужна?"]',
  '["¿Qué pequeños pasos puedo dar hoy?", "¿Cómo puedo nutrir mi crecimiento?", "¿Qué apoyo necesito?"]'
),
-- First Quarter
(
  0.25, '🌓',
  'First Quarter', 'Первая четверть', 'Cuarto Creciente',
  'Overcoming Challenges', 'Преодоление вызовов', 'Superar Desafíos',
  'Time to face obstacles and make decisions',
  'Время столкнуться с препятствиями и принять решения',
  'Tiempo de enfrentar obstáculos y tomar decisiones',
  'Strong, dynamic practice. Power yoga, warrior sequences',
  'Сильная, динамичная практика. Силовая йога, последовательности воина',
  'Práctica fuerte y dinámica. Power yoga, secuencias de guerrero',
  'Focus on your inner strength. You have the power to overcome any challenge',
  'Сосредоточьтесь на своей внутренней силе. У вас есть сила преодолеть любой вызов',
  'Enfócate en tu fuerza interior. Tienes el poder de superar cualquier desafío',
  '["Make decisions", "Face challenges head-on", "Adjust plans", "Seek guidance"]',
  '["Принимать решения", "Встречать вызовы лицом к лицу", "Корректировать планы", "Искать руководство"]',
  '["Tomar decisiones", "Enfrentar desafíos", "Ajustar planes", "Buscar orientación"]',
  '["I am strong and capable", "I overcome obstacles with grace", "I trust my decisions"]',
  '["Я сильный и способный", "Я преодолеваю препятствия с изяществом", "Я доверяю своим решениям"]',
  '["Soy fuerte y capaz", "Supero obstáculos con gracia", "Confío en mis decisiones"]',
  '["Pyrite", "Red Jasper", "Bloodstone", "Black Tourmaline"]',
  '["Пирит", "Красная яшма", "Кровавик", "Черный турмалин"]',
  '["Pirita", "Jaspe Rojo", "Heliotropo", "Turmalina Negra"]',
  '["Avoiding challenges", "Procrastinating", "Giving up on goals"]',
  '["Избегать вызовов", "Откладывать", "Отказываться от целей"]',
  '["Evitar desafíos", "Procrastinar", "Abandonar metas"]',
  '["What challenges am I facing?", "How can I overcome them?", "What strengths can I draw upon?"]',
  '["С какими вызовами я сталкиваюсь?", "Как я могу их преодолеть?", "На какие силы я могу опереться?"]',
  '["¿Qué desafíos enfrento?", "¿Cómo puedo superarlos?", "¿Qué fortalezas puedo usar?"]'
),
-- Waxing Gibbous
(
  0.40, '🌔',
  'Waxing Gibbous', 'Растущая луна', 'Luna Gibosa Creciente',
  'Refinement', 'Совершенствование', 'Refinamiento',
  'Time to refine and adjust your approach',
  'Время усовершенствовать и скорректировать ваш подход',
  'Tiempo de refinar y ajustar tu enfoque',
  'Balanced practice with attention to alignment and detail',
  'Сбалансированная практика с вниманием к выравниванию и деталям',
  'Práctica equilibrada con atención a la alineación y detalles',
  'Observe what is working and what needs adjustment. Trust the process of refinement',
  'Наблюдайте, что работает и что нуждается в корректировке. Доверьтесь процессу совершенствования',
  'Observa qué funciona y qué necesita ajuste. Confía en el proceso de refinamiento',
  '["Fine-tune plans", "Practice patience", "Express gratitude", "Review progress"]',
  '["Доработать планы", "Практиковать терпение", "Выражать благодарность", "Пересмотреть прогресс"]',
  '["Ajustar planes", "Practicar paciencia", "Expresar gratitud", "Revisar progreso"]',
  '["I am patient with the process", "I trust divine timing", "I am grateful for my progress"]',
  '["Я терпелив к процессу", "Я доверяю божественному времени", "Я благодарен за свой прогресс"]',
  '["Soy paciente con el proceso", "Confío en el tiempo divino", "Agradezco mi progreso"]',
  '["Rose Quartz", "Amethyst", "Fluorite", "Selenite"]',
  '["Розовый кварц", "Аметист", "Флюорит", "Селенит"]',
  '["Cuarzo Rosa", "Amatista", "Fluorita", "Selenita"]',
  '["Making drastic changes", "Being impatient", "Comparing to others"]',
  '["Вносить кардинальные изменения", "Быть нетерпеливым", "Сравнивать с другими"]',
  '["Hacer cambios drásticos", "Ser impaciente", "Comparar con otros"]',
  '["What needs refinement?", "How can I be more patient?", "What am I grateful for?"]',
  '["Что нуждается в доработке?", "Как я могу быть более терпеливым?", "За что я благодарен?"]',
  '["¿Qué necesita refinamiento?", "¿Cómo puedo ser más paciente?", "¿Por qué estoy agradecido?"]'
),
-- Full Moon
(
  0.50, '🌕',
  'Full Moon', 'Полнолуние', 'Luna Llena',
  'Celebration & Release', 'Празднование и освобождение', 'Celebración y Liberación',
  'Time of culmination, celebration, and letting go',
  'Время кульминации, празднования и отпускания',
  'Tiempo de culminación, celebración y dejar ir',
  'Dynamic, expressive practice. Dance, flow, and celebration',
  'Динамичная, выразительная практика. Танец, поток и празднование',
  'Práctica dinámica y expresiva. Danza, flujo y celebración',
  'Celebrate your achievements and release what no longer serves you',
  'Празднуйте свои достижения и отпустите то, что больше не служит вам',
  'Celebra tus logros y libera lo que ya no te sirve',
  '["Full moon ceremony", "Release ritual", "Charge crystals", "Moon bathing", "Forgiveness work"]',
  '["Церемония полнолуния", "Ритуал освобождения", "Зарядка кристаллов", "Лунные ванны", "Работа с прощением"]',
  '["Ceremonia de luna llena", "Ritual de liberación", "Cargar cristales", "Baño de luna", "Trabajo de perdón"]',
  '["I release what no longer serves me", "I celebrate my achievements", "I am whole and complete"]',
  '["Я отпускаю то, что больше не служит мне", "Я праздную свои достижения", "Я целостный и завершенный"]',
  '["Libero lo que ya no me sirve", "Celebro mis logros", "Soy completo y entero"]',
  '["Moonstone", "Selenite", "Clear Quartz", "Labradorite"]',
  '["Лунный камень", "Селенит", "Прозрачный кварц", "Лабрадорит"]',
  '["Piedra Luna", "Selenita", "Cuarzo Transparente", "Labradorita"]',
  '["Starting new projects", "Making impulsive decisions", "Holding onto grudges"]',
  '["Начинать новые проекты", "Принимать импульсивные решения", "Держаться за обиды"]',
  '["Comenzar nuevos proyectos", "Tomar decisiones impulsivas", "Guardar rencores"]',
  '["What am I ready to release?", "What have I accomplished?", "How can I celebrate myself?"]',
  '["Что я готов отпустить?", "Чего я достиг?", "Как я могу отпраздновать себя?"]',
  '["¿Qué estoy listo para liberar?", "¿Qué he logrado?", "¿Cómo puedo celebrarme?"]'
),
-- Waning Gibbous
(
  0.62, '🌖',
  'Waning Gibbous', 'Убывающая луна', 'Luna Gibosa Menguante',
  'Gratitude', 'Благодарность', 'Gratitud',
  'Time for gratitude and sharing wisdom',
  'Время для благодарности и обмена мудростью',
  'Tiempo de gratitud y compartir sabiduría',
  'Gentle, heart-opening practice. Focus on giving back',
  'Мягкая практика открытия сердца. Фокус на отдаче',
  'Práctica suave de apertura del corazón. Enfoque en dar',
  'Give thanks for all you have received. Share your wisdom with others',
  'Благодарите за все, что вы получили. Делитесь своей мудростью с другими',
  'Da gracias por todo lo que has recibido. Comparte tu sabiduría con otros',
  '["Practice gratitude", "Share knowledge", "Give to others", "Journal insights"]',
  '["Практиковать благодарность", "Делиться знаниями", "Давать другим", "Записывать инсайты"]',
  '["Practicar gratitud", "Compartir conocimiento", "Dar a otros", "Escribir percepciones"]',
  '["I am grateful for my journey", "I share my gifts freely", "I give from abundance"]',
  '["Я благодарен за свой путь", "Я свободно делюсь своими дарами", "Я даю от изобилия"]',
  '["Agradezco mi viaje", "Comparto mis dones libremente", "Doy desde la abundancia"]',
  '["Rose Quartz", "Green Aventurine", "Rhodonite", "Peridot"]',
  '["Розовый кварц", "Зеленый авантюрин", "Родонит", "Перидот"]',
  '["Cuarzo Rosa", "Aventurina Verde", "Rodonita", "Peridoto"]',
  '["Being ungrateful", "Hoarding resources", "Focusing on lack"]',
  '["Быть неблагодарным", "Копить ресурсы", "Фокусироваться на недостатке"]',
  '["Ser desagradecido", "Acumular recursos", "Enfocarse en la carencia"]',
  '["What am I grateful for?", "What wisdom can I share?", "How can I give back?"]',
  '["За что я благодарен?", "Какой мудростью я могу поделиться?", "Как я могу отдать?"]',
  '["¿Por qué estoy agradecido?", "¿Qué sabiduría puedo compartir?", "¿Cómo puedo retribuir?"]'
),
-- Last Quarter
(
  0.75, '🌗',
  'Last Quarter', 'Последняя четверть', 'Cuarto Menguante',
  'Letting Go', 'Отпускание', 'Dejar Ir',
  'Time to release, forgive, and clear space',
  'Время отпустить, простить и очистить пространство',
  'Tiempo de liberar, perdonar y limpiar espacio',
  'Restorative, yin practice. Focus on surrender and release',
  'Восстановительная, инь практика. Фокус на сдаче и освобождении',
  'Práctica restaurativa, yin. Enfoque en rendición y liberación',
  'Let go of control. Surrender to the natural flow of life',
  'Отпустите контроль. Сдайтесь естественному потоку жизни',
  'Suelta el control. Ríndete al flujo natural de la vida',
  '["Declutter space", "Forgive and release", "Break bad habits", "Rest and restore"]',
  '["Расхламить пространство", "Простить и отпустить", "Сломать плохие привычки", "Отдохнуть и восстановиться"]',
  '["Despejar espacio", "Perdonar y liberar", "Romper malos hábitos", "Descansar y restaurar"]',
  '["I release with love", "I forgive myself and others", "I make space for the new"]',
  '["Я отпускаю с любовью", "Я прощаю себя и других", "Я создаю пространство для нового"]',
  '["Libero con amor", "Me perdono a mí mismo y a otros", "Hago espacio para lo nuevo"]',
  '["Smoky Quartz", "Black Obsidian", "Apache Tear", "Hematite"]',
  '["Дымчатый кварц", "Черный обсидиан", "Слеза апача", "Гематит"]',
  '["Cuarzo Ahumado", "Obsidiana Negra", "Lágrima Apache", "Hematita"]',
  '["Holding onto the past", "Starting new ventures", "Excessive activity"]',
  '["Держаться за прошлое", "Начинать новые предприятия", "Чрезмерная активность"]',
  '["Aferrarse al pasado", "Comenzar nuevas empresas", "Actividad excesiva"]',
  '["What am I ready to forgive?", "What habits no longer serve me?", "How can I create space?"]',
  '["Что я готов простить?", "Какие привычки больше не служат мне?", "Как я могу создать пространство?"]',
  '["¿Qué estoy listo para perdonar?", "¿Qué hábitos ya no me sirven?", "¿Cómo puedo crear espacio?"]'
),
-- Waning Crescent
(
  0.88, '🌘',
  'Waning Crescent', 'Убывающий полумесяц', 'Luna Menguante',
  'Rest & Reflect', 'Отдых и размышление', 'Descanso y Reflexión',
  'Time for rest, reflection, and preparation',
  'Время для отдыха, размышлений и подготовки',
  'Tiempo de descanso, reflexión y preparación',
  'Very gentle, restorative practice. Meditation and breathwork',
  'Очень мягкая, восстановительная практика. Медитация и дыхательные упражнения',
  'Práctica muy suave y restaurativa. Meditación y respiración',
  'Rest deeply. Reflect on your journey. Prepare for renewal',
  'Отдыхайте глубоко. Размышляйте о своем путешествии. Готовьтесь к обновлению',
  'Descansa profundamente. Reflexiona sobre tu viaje. Prepárate para la renovación',
  '["Rest and restore", "Meditate deeply", "Dream work", "Quiet reflection", "Prepare for new cycle"]',
  '["Отдыхать и восстанавливаться", "Глубоко медитировать", "Работа со снами", "Тихое размышление", "Подготовка к новому циклу"]',
  '["Descansar y restaurar", "Meditar profundamente", "Trabajo con sueños", "Reflexión tranquila", "Preparar nuevo ciclo"]',
  '["I rest in stillness", "I honor my need for rest", "I prepare for renewal"]',
  '["Я отдыхаю в тишине", "Я чту свою потребность в отдыхе", "Я готовлюсь к обновлению"]',
  '["Descanso en quietud", "Honro mi necesidad de descanso", "Me preparo para la renovación"]',
  '["Lepidolite", "Blue Lace Agate", "Celestite", "Howlite"]',
  '["Лепидолит", "Голубой кружевной агат", "Целестин", "Говлит"]',
  '["Lepidolita", "Ágata Azul", "Celestita", "Howlita"]',
  '["Overexertion", "Starting new projects", "Social activities", "Making decisions"]',
  '["Перенапряжение", "Начало новых проектов", "Социальная активность", "Принятие решений"]',
  '["Sobreesfuerzo", "Comenzar nuevos proyectos", "Actividades sociales", "Tomar decisiones"]',
  '["What have I learned this cycle?", "What needs rest?", "How can I prepare for renewal?"]',
  '["Что я узнал в этом цикле?", "Что нуждается в отдыхе?", "Как я могу подготовиться к обновлению?"]',
  '["¿Qué he aprendido este ciclo?", "¿Qué necesita descanso?", "¿Cómo puedo prepararme para la renovación?"]'
);

-- ============================================
-- YOGA TEXTS AND QUOTES SEED DATA
-- ============================================

-- Insert source texts
INSERT INTO yoga_texts (
  title_en, title_ru, title_es,
  author, tradition, original_language, is_ancient,
  description_en, description_ru, description_es
) VALUES
(
  'Yoga Sutras', 'Йога-сутры', 'Yoga Sutras',
  'Patanjali', 'Classical Yoga', 'Sanskrit', true,
  'The foundational text of classical yoga philosophy',
  'Основополагающий текст классической философии йоги',
  'El texto fundamental de la filosofía clásica del yoga'
),
(
  'Bhagavad Gita', 'Бхагавад-гита', 'Bhagavad Gita',
  'Vyasa', 'Hindu Philosophy', 'Sanskrit', true,
  'Sacred Hindu scripture on dharma and yoga',
  'Священное индуистское писание о дхарме и йоге',
  'Escritura sagrada hindú sobre dharma y yoga'
),
(
  'Hatha Yoga Pradipika', 'Хатха-йога Прадипика', 'Hatha Yoga Pradipika',
  'Swami Swatmarama', 'Hatha Yoga', 'Sanskrit', true,
  'Classical manual on Hatha Yoga practices',
  'Классическое руководство по практикам хатха-йоги',
  'Manual clásico sobre prácticas de Hatha Yoga'
),
(
  'Light on Yoga', 'Свет йоги', 'Luz sobre el Yoga',
  'B.K.S. Iyengar', 'Modern Yoga', 'English', false,
  'Comprehensive guide to yoga asanas and philosophy',
  'Полное руководство по асанам и философии йоги',
  'Guía completa de asanas y filosofía del yoga'
),
(
  'The Heart of Yoga', 'Сердце йоги', 'El Corazón del Yoga',
  'T.K.V. Desikachar', 'Modern Yoga', 'English', false,
  'Developing a personal practice based on Viniyoga',
  'Развитие личной практики на основе винийоги',
  'Desarrollar una práctica personal basada en Viniyoga'
);

-- Insert yoga quotes
INSERT INTO yoga_quotes (
  text_id,
  quote_en, quote_ru, quote_es,
  sanskrit_original, transliteration,
  chapter, verse,
  context_en, context_ru, context_es,
  theme, difficulty_level
) VALUES
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Yoga Sutras'),
  'Yoga is the cessation of the fluctuations of the mind',
  'Йога есть прекращение колебаний ума',
  'El yoga es el cese de las fluctuaciones de la mente',
  'योगश्चित्तवृत्तिनिरोधः', 'Yogas chitta vritti nirodhah',
  '1', '2',
  'The fundamental definition of yoga according to Patanjali',
  'Фундаментальное определение йоги согласно Патанджали',
  'La definición fundamental del yoga según Patanjali',
  'Definition', 1
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Yoga Sutras'),
  'Practice becomes firmly grounded when well attended to for a long time, without break and in all earnestness',
  'Практика становится прочно укорененной, когда она выполняется долгое время, без перерыва и со всей серьезностью',
  'La práctica se vuelve firmemente establecida cuando se atiende durante mucho tiempo, sin interrupción y con toda seriedad',
  'स दीर्घकालनैरन्तर्यसत्कारासेवितो दृढभूमिः', 'Sa dirghakala nairantarya satkara asevito dridhabhumih',
  '1', '14',
  'The requirements for establishing a steady practice',
  'Требования для установления устойчивой практики',
  'Los requisitos para establecer una práctica estable',
  'Practice', 2
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Bhagavad Gita'),
  'You have a right to perform your prescribed duty, but you are not entitled to the fruits of action',
  'Ты имеешь право исполнять свой предписанный долг, но не имеешь права на плоды действий',
  'Tienes derecho a cumplir tu deber prescrito, pero no tienes derecho a los frutos de la acción',
  'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन', 'Karmanye vadhikaraste ma phaleshu kadachana',
  '2', '47',
  'The principle of non-attachment to results',
  'Принцип непривязанности к результатам',
  'El principio del desapego a los resultados',
  'Karma Yoga', 2
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Bhagavad Gita'),
  'The mind is restless, turbulent, obstinate and very strong, O Krishna',
  'Ум беспокоен, неистов, упрям и очень силен, о Кришна',
  'La mente es inquieta, turbulenta, obstinada y muy fuerte, oh Krishna',
  'चञ्चलं हि मनः कृष्ण प्रमाथि बलवद् दृढम्', 'Chanchalam hi manah krishna pramathi balavad dridham',
  '6', '34',
  'Arjuna describes the challenge of controlling the mind',
  'Арджуна описывает вызов контроля ума',
  'Arjuna describe el desafío de controlar la mente',
  'Mind', 1
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Hatha Yoga Pradipika'),
  'When the breath wanders the mind also is unsteady',
  'Когда дыхание блуждает, ум также неустойчив',
  'Cuando la respiración vaga, la mente también es inestable',
  NULL, NULL,
  '2', '2',
  'The connection between breath and mind',
  'Связь между дыханием и умом',
  'La conexión entre la respiración y la mente',
  'Pranayama', 1
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Light on Yoga'),
  'The pose begins when you want to leave it',
  'Поза начинается, когда вы хотите из нее выйти',
  'La postura comienza cuando quieres salir de ella',
  NULL, NULL,
  NULL, NULL,
  'The importance of staying present in challenging moments',
  'Важность оставаться в настоящем в сложные моменты',
  'La importancia de permanecer presente en momentos desafiantes',
  'Asana', 1
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'The Heart of Yoga'),
  'The success of Yoga does not lie in the ability to perform postures but in how it positively changes the way we live our life',
  'Успех йоги заключается не в способности выполнять позы, а в том, как она позитивно меняет нашу жизнь',
  'El éxito del Yoga no radica en la capacidad de realizar posturas sino en cómo cambia positivamente nuestra forma de vivir',
  NULL, NULL,
  NULL, NULL,
  'The true measure of yoga practice',
  'Истинная мера практики йоги',
  'La verdadera medida de la práctica del yoga',
  'Life Practice', 1
),
-- Additional inspirational quotes
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Yoga Sutras'),
  'When you are inspired by some great purpose, all your thoughts break their bonds',
  'Когда вы вдохновлены какой-то великой целью, все ваши мысли разрывают свои оковы',
  'Cuando te inspira un gran propósito, todos tus pensamientos rompen sus ataduras',
  NULL, NULL,
  '1', '1',
  'The power of purpose and inspiration',
  'Сила цели и вдохновения',
  'El poder del propósito y la inspiración',
  'Purpose', 2
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Bhagavad Gita'),
  'Yoga is the journey of the self, through the self, to the self',
  'Йога - это путешествие себя, через себя, к себе',
  'El yoga es el viaje del ser, a través del ser, hacia el ser',
  NULL, NULL,
  '6', '19',
  'The inward journey of self-discovery',
  'Внутреннее путешествие самопознания',
  'El viaje interior del autodescubrimiento',
  'Self-Discovery', 1
),
(
  (SELECT id FROM yoga_texts WHERE title_en = 'Yoga Sutras'),
  'The study of the self leads to connection with the divine',
  'Изучение себя ведет к связи с божественным',
  'El estudio del ser conduce a la conexión con lo divino',
  'स्वाध्यायादिष्टदेवतासंप्रयोगः', 'Svadhyayad ishta devata samprayogah',
  '2', '44',
  'Self-study as a path to spiritual connection',
  'Самоизучение как путь к духовной связи',
  'El autoestudio como camino a la conexión espiritual',
  'Svadhyaya', 2
);

-- ============================================
-- SET UP INITIAL SCHEDULES
-- ============================================

-- Set today's chakra focus (Root Chakra)
INSERT INTO chakra_daily_focus (date, chakra_id, meditation_minutes)
SELECT 
  CURRENT_DATE,
  id,
  15
FROM chakras 
WHERE number = 1;

-- Set tomorrow's chakra focus (Sacral Chakra)
INSERT INTO chakra_daily_focus (date, chakra_id, meditation_minutes)
SELECT 
  CURRENT_DATE + INTERVAL '1 day',
  id,
  15
FROM chakras 
WHERE number = 2;

-- Set up a sequential rotation pattern
INSERT INTO chakra_rotation_patterns (
  name_en, name_ru, name_es,
  pattern_type, rules, is_active, priority
) VALUES (
  'Weekly Sequential', 'Еженедельная последовательность', 'Secuencial Semanal',
  'sequential', 
  '{"order": "ascending", "interval": "daily", "reset_on": "sunday"}',
  true,
  1
);

-- Set today's quote
INSERT INTO daily_quotes (date, quote_id)
SELECT 
  CURRENT_DATE,
  id
FROM yoga_quotes
ORDER BY RANDOM()
LIMIT 1;

-- Set tomorrow's quote
INSERT INTO daily_quotes (date, quote_id)
SELECT 
  CURRENT_DATE + INTERVAL '1 day',
  id
FROM yoga_quotes
WHERE id NOT IN (SELECT quote_id FROM daily_quotes WHERE date = CURRENT_DATE)
ORDER BY RANDOM()
LIMIT 1;

-- Insert current moon phase data (example - you would calculate this based on actual moon phase)
INSERT INTO moon_calendar (
  date, 
  phase_id,
  exact_phase,
  illumination_percent,
  zodiac_sign_en, zodiac_sign_ru, zodiac_sign_es
)
SELECT 
  CURRENT_DATE,
  id,
  0.25,
  50.0,
  'Scorpio', 'Скорпион', 'Escorpio'
FROM moon_phases
WHERE phase_value = 0.25;

-- Add moon practice guidelines for each phase
INSERT INTO moon_practice_guidelines (
  phase_id, practice_type, intensity_level, recommended,
  guidance_en, guidance_ru, guidance_es
)
SELECT 
  mp.id, 
  pt.practice_type,
  CASE 
    WHEN mp.phase_value = 0.00 THEN 1  -- New Moon - gentle
    WHEN mp.phase_value = 0.50 THEN 5  -- Full Moon - intense
    ELSE 3  -- Others - moderate
  END,
  true,
  CASE pt.practice_type
    WHEN 'vinyasa' THEN 'Flow with the ' || mp.name_en || ' energy'
    WHEN 'yin' THEN 'Surrender to the ' || mp.name_en || ' wisdom'
    WHEN 'meditation' THEN 'Meditate on ' || mp.name_en || ' intentions'
  END,
  CASE pt.practice_type
    WHEN 'vinyasa' THEN 'Течь с энергией ' || mp.name_ru
    WHEN 'yin' THEN 'Сдаться мудрости ' || mp.name_ru
    WHEN 'meditation' THEN 'Медитировать на намерения ' || mp.name_ru
  END,
  CASE pt.practice_type
    WHEN 'vinyasa' THEN 'Fluir con la energía de ' || mp.name_es
    WHEN 'yin' THEN 'Rendirse a la sabiduría de ' || mp.name_es
    WHEN 'meditation' THEN 'Meditar en las intenciones de ' || mp.name_es
  END
FROM moon_phases mp
CROSS JOIN (
  SELECT 'vinyasa' as practice_type
  UNION SELECT 'yin'
  UNION SELECT 'meditation'
) pt;

-- Success message
SELECT 'Spiritual content seeded successfully!' as message;