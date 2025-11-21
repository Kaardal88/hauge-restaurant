export interface Menu {
  id: number;
  name: string;
  description: string;
  price: number;
}

//Full bruker interface for database funksjoner/operasjoner (registering og loginvalideringer bl.a)
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
}

//Bruker respons interface for API respons, ingen passord.
export interface UserResponse {
  id: number;
  username: string;
  email: string;
}

//Denne interfacen setter opp/representerer posts table
export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: string;
}

//Denne interfacen inkluderer alt i posts (id, title etc) sammen med username og email. Så den brukes med JOIN queries som kombinerer dataene fra to forskjellige tables. JOIN og INNER JOIN er det samme.
export interface PostWithUser extends Post {
  username: string;
  email: string;
}
