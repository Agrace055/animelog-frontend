import { defaultAvatarImage, defaultCoverImage } from "./assets/defaultImages";

export interface MediaCharacter {
  id: string;
  name: string;
  cvName: string;
  avatarUrl?: string;
}

export interface MediaStaff {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export type MediaType = 'anime' | 'novel' | 'game';

export interface Media {
  id: string;
  type: MediaType;
  title: string;
  originalTitle?: string;
  coverImage: string;
  year: number;
  episodes?: number; // for anime
  volumes?: number; // for novel
  chapters?: number; // for novel
  score: number;
  tags: string[];
  characters?: MediaCharacter[];
  staff?: MediaStaff[];
  status: 'ongoing' | 'completed' | 'upcoming';
  description?: string;
  isNsfw?: boolean;
}

export const DUMMY_ANIME: Media[] = [
  {
    id: 'a1',
    type: 'anime',
    title: '葬送的芙莉莲',
    originalTitle: '葬送のフリーレン',
    coverImage: defaultCoverImage,
    year: 2023,
    episodes: 28,
    score: 9.3,
    tags: ['奇幻', '冒险', '治愈'],
    status: 'completed',
    characters: [
      { id: 'c1', name: '芙莉莲', cvName: '种崎敦美', avatarUrl: defaultAvatarImage },
      { id: 'c2', name: '辛美尔', cvName: '冈本信彦', avatarUrl: defaultAvatarImage },
      { id: 'c3', name: '海塔', cvName: '东地宏树', avatarUrl: defaultAvatarImage },
      { id: 'c4', name: '艾冉', cvName: '上田燿司', avatarUrl: defaultAvatarImage },
      { id: 'c5', name: '菲伦', cvName: '市之濑加那', avatarUrl: defaultAvatarImage },
      { id: 'c6', name: '修塔尔克', cvName: '小林千晃', avatarUrl: defaultAvatarImage }
    ],
    staff: [
      { id: 's1', name: '山田钟人', role: '原作', avatarUrl: defaultAvatarImage },
      { id: 's2', name: '斋藤圭一郎', role: '导演 / 分镜 / 演出', avatarUrl: defaultAvatarImage },
      { id: 's3', name: '铃木智寻', role: '脚本', avatarUrl: defaultAvatarImage },
      { id: 's4', name: 'Evan Call', role: '音乐', avatarUrl: defaultAvatarImage }
    ]
  },
  {
    id: 'a2',
    type: 'anime',
    title: '咒术回战 第二季',
    originalTitle: '呪術廻戦 懐玉・玉折 / 渋谷事変',
    coverImage: defaultCoverImage,
    year: 2023,
    episodes: 23,
    score: 8.9,
    tags: ['热血', '战斗', '奇幻'],
    status: 'completed'
  },
  {
    id: 'a3',
    type: 'anime',
    title: '迷宫饭',
    originalTitle: 'ダンジョン飯',
    coverImage: defaultCoverImage,
    year: 2024,
    episodes: 24,
    score: 8.8,
    tags: ['奇幻', '美食', '搞笑'],
    status: 'ongoing'
  },
  {
    id: 'a4',
    type: 'anime',
    title: '我推的孩子',
    originalTitle: '【推しの子】',
    coverImage: defaultCoverImage,
    year: 2023,
    episodes: 11,
    score: 8.7,
    tags: ['偶像', '悬疑', '剧情'],
    status: 'completed'
  },
  {
    id: 'a5',
    type: 'anime',
    title: '深夜的秘密',
    originalTitle: 'Midnight Secret (NSFW)',
    coverImage: defaultCoverImage,
    year: 2024,
    episodes: 12,
    score: 8.0,
    tags: ['里世界', '恋爱'],
    status: 'completed',
    isNsfw: true
  }
];

export const DUMMY_NOVELS: Media[] = [
  {
    id: 'n1',
    type: 'novel',
    title: '魔法禁书目录',
    originalTitle: 'とある魔術の禁書目録',
    coverImage: defaultCoverImage,
    year: 2004,
    volumes: 22,
    score: 8.5,
    tags: ['奇幻', '科幻', '战斗'],
    status: 'completed'
  },
  {
    id: 'n2',
    type: 'novel',
    title: '刀剑神域',
    originalTitle: 'ソードアート・オンライン',
    coverImage: defaultCoverImage,
    year: 2009,
    volumes: 27,
    score: 8.2,
    tags: ['网游', '科幻', '冒险'],
    status: 'ongoing'
  },
  {
    id: 'n3',
    type: 'novel',
    title: '禁忌物语',
    originalTitle: 'Forbidden Tales (NSFW)',
    coverImage: defaultCoverImage,
    year: 2023,
    volumes: 5,
    score: 7.9,
    tags: ['里世界', '奇幻'],
    status: 'ongoing',
    isNsfw: true
  }
];

export const DUMMY_GAMES: Media[] = [
  {
    id: 'g1',
    type: 'game',
    title: '十三机兵防卫圈',
    originalTitle: '十三機兵防衛圏',
    coverImage: defaultCoverImage,
    year: 2019,
    chapters: 13,
    score: 9.0,
    tags: ['科幻', '剧情', '策略'],
    status: 'completed'
  },
  {
    id: 'g2',
    type: 'game',
    title: '星空物语',
    originalTitle: 'Starlit Chronicle',
    coverImage: defaultCoverImage,
    year: 2024,
    chapters: 8,
    score: 8.1,
    tags: ['冒险', '视觉小说'],
    status: 'ongoing'
  }
];
