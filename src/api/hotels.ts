// Mock-данные для демонстрации (если бэкенд не работает)
export const MOCK_HOTELS = [
  {
    id: 1,
    name: 'Гранд Отель Москва',
    location: 'Москва',
    description: 'Роскошный отель в центре Москвы',
    image_url: 'https://avatars.mds.yandex.net/get-altay/3511135/2a0000017a9012803a1e4a68b2ebba5f3900/L',
    rooms: [
      { id: 1, name: 'Стандарт', price_per_night: '5000' },
      { id: 2, name: 'Люкс', price_per_night: '12000' },
    ],
  },
  {
    id: 2,
    name: 'Морской Курорт',
    location: 'Сочи',
    description: 'Отель на берегу Черного моря',
    image_url: 'https://avatars.mds.yandex.net/i?id=51e8e8acf8521012bf9f893cbcc5e772f4beb1cc-9243215-images-thumbs&n=13',
    rooms: [
      { id: 3, name: 'Комфорт', price_per_night: '7000' },
      { id: 4, name: 'Делюкс', price_per_night: '15000' },
    ],
  },
  {
    id: 3,
    name: 'Горный Лаунж',
    location: 'Красная Поляна',
    description: 'Уютный отель в горах',
    image_url: 'https://avatars.mds.yandex.net/i?id=b28ba7da392afcee57c3406c4d97590608f6796f-4120709-images-thumbs&n=13',
    rooms: [
      { id: 5, name: 'Стандарт', price_per_night: '6000' },
    ],
  },
  {
    id: 4,
    name: 'Сити Центр',
    location: 'Санкт-Петербург',
    description: 'Отель рядом с Эрмитажем',
    image_url: 'https://avatars.mds.yandex.net/i?id=f2429d5d7126a09a3b74aff24ec92b480f3ec889-9065879-images-thumbs&n=130',
    rooms: [
      { id: 6, name: 'Эконом', price_per_night: '3500' },
      { id: 7, name: 'Стандарт', price_per_night: '5500' },
    ],
  },
  {
    id: 5,
    name: 'Озеро Байкал',
    location: 'Байкал',
    description: 'Эко-отель на берегу озера',
    image_url: 'https://kmp.ru/upload/resize_cache/iblock/851/sdhb7454vsw6410lab5hb3pgie58a9p4/900_520_1/baikal_wood_eco_lodge_spa_olhon_rossiya_hero.jpg',
    rooms: [
      { id: 8, name: 'Комфорт', price_per_night: '8000' },
    ],
  },
];

// Вспомогательные функции для работы с localStorage
const getMockHotels = (): typeof MOCK_HOTELS => {
  const stored = localStorage.getItem('mock_hotels');
  if (stored) {
    return JSON.parse(stored);
  }
  return [...MOCK_HOTELS];
};

const saveMockHotels = (hotels: typeof MOCK_HOTELS) => {
  localStorage.setItem('mock_hotels', JSON.stringify(hotels));
};

export const getHotels = async (params: URLSearchParams) => {
  try {
    const response = await fetch(`/hotels/?${params.toString()}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Бэкенд недоступен');
    }

    const data = await response.json();
    
    // ✅ Защита: бэкенд может вернуть массив или объект
    if (Array.isArray(data)) {
      return {
        total: data.length,
        hotels: data,
      };
    }
    
    return {
      total: data.total || 0,
      hotels: data.hotels || [],
    };
  } catch {
    console.log('Используем mock-данные');
    
    const page = parseInt(params.get('page') || '1');
    const pageSize = parseInt(params.get('page_size') || '10');
    const location = params.get('location') || '';
    
    let filtered = getMockHotels();
    
    if (location) {
      filtered = filtered.filter(h =>
        h.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      total: filtered.length,
      hotels: filtered.slice(start, end),
    };
  }
};

// ✅ ИСПРАВЛЕНО: тип без обязательного rooms
export const addHotel = async (hotelData: {
  name: string
  location: string
  description: string
  image_url: string
}) => {
  try {
    const { apiClient } = await import('./client');
    const response = await apiClient.post('/admin/hotels', hotelData);
    return response.data;
  } catch {
    // Сохраняем в localStorage с пустым rooms
    const hotels = getMockHotels();
    const newHotel = {
      id: Date.now(),
      ...hotelData,
      rooms: [], // ✅ Добавляем пустой массив rooms
    };
    hotels.push(newHotel);
    saveMockHotels(hotels);
    return newHotel;
  }
};

// Функция для получения всех отелей (для админки)
export const getAllHotels = async () => {
  try {
    const { apiClient } = await import('./client');
    const response = await apiClient.get('/admin/hotels');
    return response.data;
  } catch {
    return getMockHotels();
  }
};