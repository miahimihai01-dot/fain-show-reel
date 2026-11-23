import movie1 from "@/assets/movie-1.webp";
import movie2 from "@/assets/movie-2.webp";
import movie3 from "@/assets/movie-3.webp";
import movie4 from "@/assets/movie-4.webp";
import movie5 from "@/assets/movie-5.webp";
import movie6 from "@/assets/movie-6.webp";
import anime1 from "@/assets/anime-1.webp";
import anime2 from "@/assets/anime-2.webp";
import anime3 from "@/assets/anime-3.webp";
import anime4 from "@/assets/anime-4.webp";
import cartoon1 from "@/assets/cartoon-1.webp";
import cartoon2 from "@/assets/cartoon-2.webp";
import cartoon3 from "@/assets/cartoon-3.webp";
import cartoon4 from "@/assets/cartoon-4.webp";
import manga1 from "@/assets/manga-1.webp";
import manga2 from "@/assets/manga-2.webp";
import manga3 from "@/assets/manga-3.webp";
import manga4 from "@/assets/manga-4.webp";
import mangaPage1 from "@/assets/manga-page-1.webp";
import mangaPage2 from "@/assets/manga-page-2.webp";
import mangaPage3 from "@/assets/manga-page-3.webp";
import mangaPage4 from "@/assets/manga-page-4.webp";
import product1 from "@/assets/product-1.webp";
import product2 from "@/assets/product-2.webp";
import product3 from "@/assets/product-3.webp";
import product4 from "@/assets/product-4.webp";
import short1 from "@/assets/short-1.webp";
import short2 from "@/assets/short-2.webp";
import short3 from "@/assets/short-3.webp";

export type Movie = {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  description: string;
  poster: string;
};

export type Anime = {
  id: string;
  title: string;
  genre: string;
  episodes: number;
  rating: number;
  poster: string;
};

export type Audience = "copii" | "adulti";

export type Cartoon = {
  id: string;
  title: string;
  audience: Audience;
  episodes: number;
  rating: number;
  description: string;
  poster: string;
};

export type Manga = {
  id: string;
  title: string;
  genre: string;
  chapters: number;
  rating: number;
  description: string;
  cover: string;
  /** Sample pages of chapter 1. */
  pages: string[];
};

/** Short videos may be at most 3 minutes long. */
export const MAX_SHORT_SECONDS = 180;

export function isShortDurationAllowed(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds > 0 && seconds <= MAX_SHORT_SECONDS;
}

/** 95 -> "1:35" */
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export type Comment = { user: string; text: string };

export type Clip = {
  id: string;
  username: string;
  description: string;
  song: string;
  likes: number;
  comments: Comment[];
  shares: number;
  durationSec: number;
  src: string;
  poster: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  priceLei: number;
  image: string;
};

export const clips: Clip[] = [
  {
    id: "meduze",
    username: "ocean.fain",
    description: "Meduzele dansează în lumină 🌊 #natura #relaxare",
    song: "Valuri liniștite — Ocean Sound",
    likes: 12400,
    shares: 310,
    comments: [
      { user: "maria.ro", text: "Ce frumos! 😍" },
      { user: "andrei_92", text: "Super relaxant" },
    ],
    durationSec: 10,
    src: "/videos/short-1.mp4",
    poster: short1,
  },
  {
    id: "floare",
    username: "natura.ro",
    description: "O floare se deschide în câteva secunde 🌸 #primavara",
    song: "Dimineață în grădină — Natura Mix",
    likes: 8900,
    shares: 145,
    comments: [
      { user: "ioana.flori", text: "Minunat!" },
      { user: "radu.b", text: "Cum ai filmat asta?" },
    ],
    durationSec: 10,
    src: "/videos/short-2.mp4",
    poster: short2,
  },
  {
    id: "iepure",
    username: "animatie.show",
    description: "Iepurașul are o zi grea în pădure 🐰 #animatie #fun",
    song: "Pădurea veselă — Cartoon Beats",
    likes: 23100,
    shares: 820,
    comments: [
      { user: "elena.m", text: "Hahaha 😂" },
      { user: "vlad.c", text: "Clasic!" },
    ],
    durationSec: 10,
    src: "/videos/short-3.mp4",
    poster: short3,
  },
];

export const movies: Movie[] = [
  { id: "umbra-rosie", title: "Umbra Roșie", genre: "Thriller", year: 2026, rating: 8.4, poster: movie1,
    description: "Un detectiv singuratic urmărește un hoț misterios prin orașul ploios, unde fiecare indiciu îl duce mai aproape de propriul trecut." },
  { id: "noaptea-lupilor", title: "Noaptea Lupilor", genre: "Fantasy", year: 2025, rating: 8.9, poster: movie2,
    description: "În Carpați, sub o lună roșie, o haită de lupi păzește un secret vechi de o mie de ani. Un sat întreg depinde de ei." },
  { id: "orasul-tacut", title: "Orașul Tăcut", genre: "Dramă", year: 2024, rating: 7.8, poster: movie3,
    description: "Într-un oraș vechi unde nimeni nu mai vorbește, o singură fereastră rămâne aprinsă în fiecare noapte." },
  { id: "ultimul-semnal", title: "Ultimul Semnal", genre: "SF", year: 2026, rating: 8.6, poster: movie4,
    description: "Un astronaut primește un semnal din spațiu care pare să vină chiar de pe Pământ, din viitor." },
  { id: "focul-din-munti", title: "Focul din Munți", genre: "Acțiune", year: 2025, rating: 8.1, poster: movie5,
    description: "Un călăreț trebuie să salveze satul de un incendiu uriaș care coboară din munți. Are doar o noapte." },
  { id: "dincolo-de-ceata", title: "Dincolo de Ceață", genre: "Mister", year: 2024, rating: 7.9, poster: movie6,
    description: "O barcă goală apare în fiecare dimineață pe lac. Nimeni nu știe cine o trimite sau de unde vine." },
];

export const animes: Anime[] = [
  { id: "sabia-lunii", title: "Sabia Lunii", genre: "Acțiune · Samurai", episodes: 24, rating: 8.7, poster: anime1 },
  { id: "academia-spiritelor", title: "Academia Spiritelor", genre: "Magie · Școală", episodes: 12, rating: 8.2, poster: anime2 },
  { id: "pilotul-de-otel", title: "Pilotul de Oțel", genre: "Mecha · SF", episodes: 26, rating: 8.5, poster: anime3 },
  { id: "drumul-dragonului", title: "Drumul Dragonului", genre: "Aventură · Fantasy", episodes: 48, rating: 9.0, poster: anime4 },
];

export const cartoons: Cartoon[] = [
  { id: "ursuletul-bobi", title: "Ursulețul Bobi", audience: "copii", episodes: 52, rating: 8.8, poster: cartoon1,
    description: "Bobi pleacă în fiecare zi într-o aventură nouă prin pădure, alături de prietenii lui." },
  { id: "pufi-zboara", title: "Pufi Zboară", audience: "copii", episodes: 40, rating: 8.5, poster: cartoon2,
    description: "O pisicuță curajoasă zboară cu un avion de hârtie peste Orașul Jucăriilor." },
  { id: "orasul-ciudat", title: "Orașul Ciudat", audience: "adulti", episodes: 20, rating: 8.3, poster: cartoon3,
    description: "Un angajat obosit și un porumbel care vorbește descoperă cât de absurdă e viața la oraș." },
  { id: "vecinii-din-blocul-7", title: "Vecinii din Blocul 7", audience: "adulti", episodes: 30, rating: 8.6, poster: cartoon4,
    description: "Certuri, bârfe și momente amuzante între vecinii unui bloc din cartier." },
];

export const audienceLabel: Record<Audience, string> = {
  copii: "Pentru copii",
  adulti: "Pentru adulți 16+",
};

export const mangas: Manga[] = [
  { id: "vanatorul-de-umbre", title: "Vânătorul de Umbre", genre: "Acțiune · Întuneric", chapters: 112, rating: 8.9, cover: manga1, pages: [mangaPage1],
    description: "Un vânător cu ochi roșii urmărește creaturile din umbră pe acoperișurile orașului." },
  { id: "florile-de-cires", title: "Florile de Cireș", genre: "Romantic · Școală", chapters: 64, rating: 8.4, cover: manga2, pages: [mangaPage2],
    description: "O întâlnire sub cireșii înfloriți schimbă tot anul școlar pentru doi colegi." },
  { id: "regele-arenei", title: "Regele Arenei", genre: "Luptă · Sport", chapters: 205, rating: 8.7, cover: manga3, pages: [mangaPage3],
    description: "Un tânăr luptător vrea să devină cel mai bun din arena cea mare." },
  { id: "lumea-de-dincolo", title: "Lumea de Dincolo", genre: "Fantasy · Isekai", chapters: 88, rating: 8.5, cover: manga4, pages: [mangaPage4],
    description: "Un călător trece printr-un portal roșu și ajunge într-o lume cu insule zburătoare." },
];

export function formatRating(r: number): string {
  return r.toFixed(1).replace(".", ",");
}

export const products: Product[] = [
  { id: "tricou", name: "Tricou FainShow", description: "Bumbac 100%, negru cu logo roșu", priceLei: 89, image: product1 },
  { id: "sapca", name: "Șapcă Cinema", description: "Neagră, cusături roșii", priceLei: 69, image: product2 },
  { id: "popcorn", name: "Popcorn XL", description: "Găleată mare pentru seara de film", priceLei: 25, image: product3 },
  { id: "hanorac", name: "Hanorac Noapte", description: "Călduros, cu șnururi roșii", priceLei: 179, image: product4 },
];

/** 12400 -> "12,4K", 950 -> "950" (Romanian decimal comma). */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",").replace(",0", "")}K`;
  return String(n);
}

export function formatLei(value: number): string {
  return `${value} lei`;
}
