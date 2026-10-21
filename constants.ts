
/**
 * Rationale: Remove discontinued and rate-limited alternatives (Puter, LLM7, Pixazo),
 * leaving only Google Gemini and Hugging Face with current global models and streamlined setup.
 * Reference Task: Simplify AI alternatives to Gemini and Hugging Face.
 */
import type { SamplePromptsData, ProviderKey } from './types';

export const PROVIDERS: Record<ProviderKey, {
  id: ProviderKey;
  name: string;
  badge?: string;
  description: string;
  requiresKey: boolean;
  keyLink: string;
  keyPrefix: string;
  setupTime: string;
  models: {
    image: string;
    text: string;
  };
}> = {
  google_flash: {
    id: 'google_flash',
    name: 'Google Gemini (Flash)',
    badge: 'Recommended',
    description: 'Fast, versatile Google Gemini multimodal AI. Perfect for rapid scenario iteration and crisp details.',
    requiresKey: true,
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AIza...',
    setupTime: '< 1 minute',
    models: {
      image: 'gemini-2.5-flash-image',
      text: 'gemini-3.8-flash'
    }
  },
  google_pro: {
    id: 'google_pro',
    name: 'Google Gemini (Pro)',
    badge: 'Pro Quality',
    description: 'High-fidelity Google Gemini Pro. Delivers complex spatial reasoning and studio-quality realism.',
    requiresKey: true,
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AIza...',
    setupTime: '< 1 minute',
    models: {
      image: 'gemini-3-pro-image',
      text: 'gemini-3.1-pro-preview'
    }
  },
  huggingface: {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open-source image generation (FLUX / Stable Diffusion) via Hugging Face Serverless Inference API.',
    requiresKey: true,
    keyLink: 'https://huggingface.co/settings/tokens',
    keyPrefix: 'hf_...',
    setupTime: '< 1 minute',
    models: {
      image: 'black-forest-labs/FLUX.1-schnell',
      text: 'meta-llama/Llama-3.2-3B-Instruct'
    }
  }
};

export const GEMINI_AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', category: 'image', desc: 'Fast, high-efficiency multimodal image generation' },
  { id: 'gemini-3.1-flash-lite-image', name: 'Gemini 3.1 Flash Lite Image', category: 'image', desc: 'High-throughput lightweight image generation' },
  { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image', category: 'image', desc: 'High-detail photorealistic image synthesis' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', category: 'text', desc: 'State-of-the-art multimodal reasoning for text & descriptions' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', category: 'text', desc: 'Deep reasoning for architectural & spatial descriptions' },
];


export const VEO_MODEL_NAME = 'veo-3.1-fast-generate-preview';

export const SAMPLE_PROMPTS_STRUCTURED: SamplePromptsData = [
  {
    name: "Residential Segments",
    segments: [
      {
        name: "Flex homes",
        prompts: {
          flexibility: "Place the provided Corkbrick solutions in a modern, open-plan apartment decorated with large, vibrant paintings and numerous potted plants, with floor-to-ceiling windows overlooking Central Park in New York City.",
          assembly: "Show the provided modular furniture in a cozy, Scandinavian-style bedroom, featuring sustainable wool rugs, linen curtains, and a beautiful watercolor painting, with a large window revealing a snowy view of the Swiss Alps.",
          sustainability: "Integrate the provided solutions into a luxurious penthouse in Dubai, decorated with modern sculptures and lush greenery, with massive windows showcasing the Burj Khalifa at night.",
          urban: "Imagine the provided living set in a chic apartment in Rome, featuring terracotta plant pots and minimalist art, with a window view of the Colosseum at sunset.",
          coastal: "Display the provided solution in a bright, airy beach house in Malibu, decorated with driftwood art and large leafy plants, with sliding glass doors opening to the Pacific Ocean."
        }
      },
      {
        name: "Home-working",
        prompts: {
          flexibility: "Set up this home office in the corner of a living room decorated with ergonomic furniture and beautiful modern art, with a panoramic window view of the London skyline, including The Shard.",
          assembly: "Place this office structure in a lush, green backyard garden filled with sustainable, native plants, offering a clear view of the Golden Gate Bridge in the distance.",
          sustainability: "Display this ergonomic desk setup in a rustic home office in a Tuscan villa, decorated with classic paintings and overflowing plant pots, with a large arched window looking out over rolling vineyards.",
          tranquil: "Create a serene home office with these solutions in a Japanese-style home, featuring minimalist decoration, a single beautiful bonsai tree, and a large window overlooking a zen garden and Mount Fuji."
        }
      },
      {
        name: "Airbnb, short-term rentals",
        prompts: {
          flexibility: "Use these solutions to divide a stylish, compact studio apartment in Paris, decorated with chic, modern art and hanging plants, with a balcony view of the Eiffel Tower.",
          assembly: "Arrange this versatile furniture in a bright, welcoming Airbnb guest room on a Greek island like Santorini, featuring blue and white decor and local pottery, with a large window opening to the Aegean Sea.",
          sustainability: "Show this welcome area in a trendy rental loft in Tokyo's Shibuya district, decorated with neon art and contemporary paintings, with massive windows showing the city lights.",
          historic: "Place this modular furniture in a short-term rental inside a traditional canal house in Amsterdam, decorated with replica Dutch master paintings and tulips in vases, with large windows facing the canal."
        }
      },
      {
        name: "Eco-homes",
        prompts: {
          flexibility: "Place this furniture inside a beautiful eco-home made of wood and glass, deep in the Amazon Rainforest, decorated with native plants and sustainable textiles.",
          assembly: "Show these interior solutions in a cozy cabin overlooking a Norwegian Fjord, with a warm fireplace, sustainable wood furniture, and the Northern Lights visible outside.",
          sustainability: "Render this structure as part of a sustainable home built into a hillside in Bali, decorated with local crafts and surrounded by a garden with a panoramic view of rice terraces.",
          natural: "Integrate this solution into a treehouse-style home in a Costa Rican cloud forest, filled with tropical plants and offering misty mountain views through the windows."
        }
      }
    ]
  },
  {
    name: "Commercial Segments",
    segments: [
      {
        name: "Coworking",
        prompts: {
          flexibility: "Arrange these dividers and pods within a large, industrial-style coworking space in Berlin, decorated with street art-style murals and lots of green plants, with massive warehouse windows looking out towards the Fernsehturm.",
          assembly: "Use these solutions to separate desks in a modern coworking office in Sydney, featuring decor with sustainable materials and a stunning view of the Opera House and Harbour Bridge through a glass wall.",
          sustainability: "Place these solutions in the vibrant common area of a tech campus in Silicon Valley, decorated with modern art installations and indoor trees, with large windows looking onto a modern courtyard.",
          urban: "Design a coworking space within a historic building in Barcelona's Gothic Quarter, blending the modern, sustainable modules with ancient stone arches and decorating with contemporary paintings."
        }
      },
      {
        name: "Flexible offices",
        prompts: {
          flexibility: "Show this reconfigurable office furniture in a bright, flexible office on a top floor in Manhattan, decorated with large abstract paintings and tall plants, with a huge window looking at the Empire State Building.",
          assembly: "Create a quiet collaboration zone with these walls inside an open-plan office in Chicago, featuring ergonomic seating and sustainable decor, with a view of Millennium Park and 'The Bean'.",
          sustainability: "Display this custom lobby furniture in the reception area of a corporate office in Hong Kong, decorated with a living plant wall and modern art, offering a panoramic view of Victoria Harbour.",
          urban: "Arrange these office pods in a modern building in Toronto, with interiors featuring sustainable Canadian wood and art, and floor-to-ceiling windows offering a clear view of the CN Tower."
        }
      },
      {
        name: "Art Galleries, exhibitions",
        prompts: {
          flexibility: "Use these movable walls to display contemporary art in a minimalist gallery in the Tate Modern, decorated with a few carefully placed sculptural plants, with a large window overlooking the Millennium Bridge.",
          assembly: "Place a modern sculpture on this display plinth in the grand hall of the Louvre Museum, with the glass pyramid visible through a nearby entrance.",
          sustainability: "Set up these modules for a temporary exhibit inside the Guggenheim Museum in New York, with the exhibit's theme reflected in subtle, sustainable decorations.",
          classic: "Create a special exhibition space with these walls inside the Uffizi Gallery in Florence to display Renaissance drawings, using modern, ergonomic benches for viewers."
        }
      },
      {
        name: "Event organisers",
        prompts: {
          flexibility: "Build a custom, eye-catching booth with these modules for a busy tech fair like CES in Las Vegas, decorated with futuristic lighting and sustainable, recyclable graphics.",
          assembly: "Use these as acoustic walls for a VIP lounge at the Monaco Formula 1 Grand Prix, decorated with sleek, modern furniture and elegant floral arrangements, with a view of the harbor.",
          sustainability: "Arrange this seating and info stand on a red carpet event at the Cannes Film Festival, decorated with glamorous, sustainable materials.",
          urban: "Design a pop-up stage with these modules for a New Year's Eve performance in Times Square, decorating the stage with a vertical garden."
        }
      },
      {
        name: "Hotels",
        prompts: {
          flexibility: "Set up this modular seating in a luxury hotel lobby in an overwater bungalow in Bora Bora, decorated with local flowers and sustainable wood, with a view of the turquoise lagoon.",
          assembly: "Place this furniture in a sophisticated safari lodge lounge in the Serengeti, decorated with African art and textiles, with a large open window overlooking the savanna at sunset.",
          sustainability: "Show this as a room divider in a suite at the Ice Hotel in Sweden, with the icy walls complemented by warm, sustainable fabrics and soft lighting.",
          urban: "Arrange this furniture in a penthouse suite at the Bellagio in Las Vegas, decorated with opulent modern paintings and sculptures, with a grand window overlooking the famous fountain show."
        }
      }
    ]
  },
  {
    name: "Public Spaces Segments",
    segments: [
      {
        name: "Listed, historic buildings",
        prompts: {
          flexibility: "Create a 'gallery within a gallery' using these free-standing solutions inside a grand hall of the Palace of Versailles. The modern, sustainable structures should be decorated with minimalist art and tall plants, creating a stark, beautiful contrast with the ornate historical details.",
          assembly: "Place this temporary pavilion structure within a historic temple garden in Kyoto. It should serve as a serene tea house, furnished with ergonomic, low-profile seating and surrounded by ikebana-style plant arrangements, blending harmoniously with the garden during cherry blossom season.",
          sustainability: "Show these modules forming a modern, multi-level office inside a restored Venetian Palazzo. Decorate with contemporary glass sculptures and rich textiles, contrasting the sustainable Corkbrick with the building's history. A large gothic window should overlook the Grand Canal.",
          historic: "Arrange these modular solutions to create an elegant reception area for a private event inside a chamber of Prague Castle. The space should be decorated with modern candelabras and lush floral arrangements, with the stunning nighttime view of the city visible through a large, historic window."
        }
      },
      {
        name: "Schools and Universities",
        prompts: {
          flexibility: "Arrange this modular furniture in a modern classroom at Stanford University, decorated with inspiring educational posters and many low-maintenance plants, with large windows looking out onto the main quad.",
          assembly: "Use these acoustic walls to create quiet study nooks in a grand, sunlit library at Cambridge University, with each nook having its own reading light and small plant.",
          sustainability: "Show this as a fun, creative play structure in a kindergarten decorated with colorful, non-toxic paintings and sustainable wood toys, with large windows and a view of a green, sunny playground.",
          historic: "Set up a temporary exhibition with these modules in a historic hall at Harvard University, using sustainable lighting to highlight student art."
        }
      },
      {
        name: "Airports",
        prompts: {
          flexibility: "Set up these modules as temporary info barriers in the Jewel Changi Airport in Singapore, decorated with tropical plants to match the famous indoor waterfall in the background.",
          assembly: "Create a comfortable seating area in the Emirates business lounge at Dubai International Airport (DXB), featuring ergonomic chairs and beautiful Islamic art on the walls, with a view of the runway.",
          sustainability: "Apply this as sound-dampening wall cladding at a boarding gate at LAX, decorated with large-scale photographs of California's national parks, with a distant view of the Hollywood sign.",
          modern: "Design a pop-up luxury retail store using these modules inside the main terminal of Heathrow Airport, with sleek, minimalist decoration and high-end finishes."
        }
      },
      {
        name: "Museums",
        prompts: {
          flexibility: "Use these adaptable structures to build an engaging exhibition about ancient Egypt inside the British Museum, decorated with dramatic lighting and large-scale graphics, near the Rosetta Stone display.",
          assembly: "Place this interactive seating in the children's section of the Smithsonian National Air and Space Museum, decorated with models of planets and spaceships.",
          sustainability: "Show this as a temporary information stand for a special exhibition at The Metropolitan Museum of Art in New York, made from recycled materials and decorated with a single, elegant floral arrangement.",
          classic: "Create a viewing area with these ergonomic benches in front of Velázquez's 'Las Meninas' at the Prado Museum in Madrid."
        }
      },
      {
        name: "Sport Centres",
        prompts: {
          flexibility: "Build a temporary VIP box with these modules overlooking Centre Court at Wimbledon, decorated with classic tennis memorabilia and fresh flowers.",
          assembly: "Arrange these benches and storage units in the locker room of the Camp Nou stadium in Barcelona, keeping the decoration minimal and functional but with high-quality, sustainable materials.",
          sustainability: "Show these modules as acoustic panels on the walls of a basketball court at Madison Square Garden, decorated with iconic photos of past games.",
          historic: "Create a pop-up merchandise shop outside the Panathenaic Stadium in Athens, decorated with olive leaf motifs and imagery from the first modern Olympics."
        }
      },
      {
        name: "Theatres and Movie studios",
        prompts: {
          flexibility: "Create a reusable, modular set for a play at Shakespeare's Globe Theatre in London, using sustainable materials that evoke the Elizabethan era in a modern way.",
          assembly: "Use these as acoustic panels to build a sound-proof enclosure on a professional sound stage at Universal Studios Hollywood, with an ergonomic setup for technicians.",
          sustainability: "Assemble these modules into tiered seating risers for a special performance inside the Sydney Opera House, decorated with elegant, sustainable fabrics.",
          outdoor: "Design an outdoor stage and seating area with these modules for a concert at the Hollywood Bowl, decorated with beautiful plants that thrive in the California climate."
        }
      },
      {
        name: "Markets and trade fairs",
        prompts: {
          flexibility: "Design a vibrant, welcoming stall for the Grand Bazaar in Istanbul using these customizable modules, decorated with traditional Turkish textiles and lanterns.",
          assembly: "Set up a trendy pop-up food stall at La Boqueria market in Barcelona, decorated with fresh herbs and colorful tiles.",
          sustainability: "Show these display shelves at a magical Christmas Market in front of the Cologne Cathedral in Germany, decorated with fairy lights and sustainable, handcrafted ornaments.",
          modern: "Create a futuristic exhibition booth for a technology fair at the Tokyo Big Sight convention center, with integrated digital displays and minimalist, plant-based decoration."
        }
      }
    ]
  }
];

export const DEFAULT_SYSTEM_PROMPT = `You are an expert interior designer and photo editor with a focus on sustainable and modern design. The user will provide up to five images of 'Corkbrick' solutions. Your task is to artistically combine all the Corkbrick items from the images into a single, cohesive, and beautifully decorated scene that matches the user's text prompt. The final image should be highly decorative, featuring elements like lush indoor plants, modern paintings, and sustainable materials. Focus on changing the background and environment while keeping the Corkbrick items as the central, unchanged subjects. Do not change the Corkbrick items themselves, only their surroundings and the image's aesthetic.`;
export const DEFAULT_VIDEO_PROMPT = `Create a short, cinematic video with a gentle, slow 'walk-around' or panning camera motion of the scene. The video should be calm and visually appealing, highlighting the atmosphere.`;
