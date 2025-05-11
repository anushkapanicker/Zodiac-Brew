export interface Founder {
  id: number;
  name: string;
  role: string;
  image: string;
}

const founderData: Founder[] = [
  {
    id: 1,
    name: "Anushka Panicker",
    role: "Backend & Integration Engineer",
    image: "/public/anushka_panicker.jpeg" 
  },
  {
    id: 2,
    name: "Arushi",
    role: "Frontend Developer",
    image: "/public/arushi.jpeg" 
  },
  {
    id: 4,
    name: "Balveer Singh",
    role: "Frontend Developer",
    image: "/public/balveer.jpeg"
  },
  {
    id: 3,
    name: "Anushka Jain",
    role: "Integration",
    image: "/public/anushka_jain.jpeg" 
  },
];

export default founderData;