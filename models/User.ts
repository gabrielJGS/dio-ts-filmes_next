import axios from "axios";
const baseUrl = `https://api.themoviedb.org/3`;

export default class User {
  login: string;
  password: string;
  apiKey: string;
  requestToken: string;
  sessionId: string;
  account_id: string;

  constructor(
    login: string,
    password: string,
    apiKey: string,
    requestToken: string = "",
    account_id: string = "",
    sessionId: string = ""
  ) {
    this.login = login;
    this.password = password;
    this.apiKey = apiKey;
    this.requestToken = requestToken;
    this.sessionId = sessionId;
    this.account_id = account_id;
  }

  async criarRequestToken() {
    if (this.requestToken && this.requestToken != "") return;
    const url = `${baseUrl}/authentication/token/new?api_key=${this.apiKey}`;
    await axios
      .get(url)
      .then((result) => {
        this.requestToken = result.data.request_token;
        return result.data.request_token;
      })
      .catch((err) => {
        console.error(err);
        // throw new Error(err.response.data.status_message);
      });
  }

  async logar() {
    const url = `${baseUrl}/authentication/token/validate_with_login?api_key=${this.apiKey}`;
    const body = {
      username: `${this.login}`,
      password: `${this.password}`,
      request_token: `${this.requestToken}`,
    };
    await axios.post(url, body).catch((err) => {
      console.error(err);
      // throw new Error(err.response.data.status_message);
    });
  }

  async criarSessao() {
    if (this.sessionId) return;
    const url = `${baseUrl}/authentication/session/new?api_key=${this.apiKey}&request_token=${this.requestToken}`;

    const result: any = await axios.get(url).catch((err) => {
      console.error(err.response.data);
      // throw new Error(err.response.data.status_message);
    });
    if (result.data.session_id) {
      this.sessionId = result.data.session_id;
      return result.data.session_id;
    }
  }

  async criarLista(nomeDaLista: string, descricao: string) {
    const url = `https://api.themoviedb.org/3/list?api_key=${this.apiKey}&session_id=${this.sessionId}`;
    return await axios
      .post(url, {
        name: nomeDaLista,
        description: descricao,
        language: "pt-br",
      })
      .catch((err) => {
        console.error(err.response.data);
        // throw new Error(err.response.data.status_message);
      });
  }

  async adicionarFilmeNaLista(filmeId: number, listaId: number) {
    const url = `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${this.apiKey}&session_id=${this.sessionId}`;
    return await axios
      .post(url, {
        media_id: filmeId,
      })
      .catch((err) => {
        console.error(err.response.data);
        // throw new Error(err.response.data.status_message);
      });
  }

  async pegarLista(listId: number) {
    const url = `https://api.themoviedb.org/3/list/${listId}?api_key=${this.apiKey}&language=pt-BR`;
    const listaInfo: any = await axios.get(url).catch((err) => {
      console.error(err.response.data);
      // throw new Error(err.response.data.status_message);
    });
    return listaInfo.data;
  }

  async getDetails() {
    if (!this.sessionId) return undefined;

    const url = `https://api.themoviedb.org/3/account?api_key=${this.apiKey}&session_id=${this.sessionId}`;
    const response: any = await axios.get(url).catch((err) => {
      console.error(err.response.data);
      // throw new Error(err.response.data.status_message);
    });
    this.account_id = response.data.id;
    return response.data.id;
  }

  async getLists() {
    if (!this.account_id) await this.getDetails();
    const url = `https://api.themoviedb.org/3/account/${this.account_id}/lists?api_key=${this.apiKey}&session_id=${this.sessionId}`;
    const result: any = await axios.get(url).catch((err) => {
      console.error(err.response.data);
      // throw new Error(err.response.data.status_message);
    });
    return result.data;
  }

  async procurarFilme(query: string) {
    query = encodeURI(query);
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${query}&language=pt-BR`;
    let result: any = await axios.get(url).catch((err) => {
      console.error(err.response.data);
      // throw new Error(err.response.data.status_message);
    });
    return result.data;
  }

  async removeMovie(listId: number, movieId: number) {
    if (!this.account_id) await this.getDetails();
    const url = `https://api.themoviedb.org/3/list/${listId}/remove_item?api_key=${this.apiKey}&session_id=${this.sessionId}`;
    const result:any = await axios
      .post(url, {
        media_id: movieId,
      })
      .catch((err) => {
        console.error(err.response.data);
        // throw new Error(err.response.data.status_message);
      });
    return result.data;
  }
}
