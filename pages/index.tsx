import type { NextPage } from "next";
import {
  TextField,
  Button,
  FormGroup,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";

import LoadingButton from "@mui/lab/LoadingButton";
import React, { useState, useEffect } from "react";
import User from "../models/User";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const baseUrlAvatar = `https://image.tmdb.org/t/p/w200`;

  let user: any;
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [novaLista, setNovaLista] = useState("");
  const [selList, setSelList] = useState(0);
  const [selListName, setSelListName] = useState("");

  const [lists, setLists] = useState<any[]>([]);
  const [listPage, setListPage] = useState(0);

  const [isLoadingMovie, setIsLoadingMovie] = useState(false);
  const [searchMovie, setSearchMovie] = useState("");
  const [movies, setMovies] = useState([]);
  const [moviesPage, setMoviesPage] = useState(0);

  const [isLoadingListMovie, setIsLoadingListMovie] = useState(false);
  const [listMovies, setListMovies] = useState([]);
  const [listMoviesPage, setListMoviesPage] = useState(0);

  if (typeof window !== "undefined") {
    const exists = localStorage.getItem("user");
    if (!exists) {
      router.push("./login");
    } else {
      const u = JSON.parse(exists);
      user = new User(u.login, u.password, u.apiKey, "", "", u.sessionId);
    }
  }

  useEffect(() => {
    // Handles movie list loading
    async function getList() {
      if (!user.requestToken) {
        await user.criarRequestToken();
        await user.logar();
        await user.criarSessao();
        await user.getDetails();
      }

      user.getLists().then((list: any) => {
        setListPage(list.page);
        setLists(list.results);
      });
    }

    if (user) {
      getList();
    }
  }, []);

  const handleNewList = async () => {
    if (novaLista.length < 4) {
      alert("Preencha o nome antes de criar uma lista");
      return;
    }
    if (isLoadingList) return;
    setIsLoadingList(true);
    await user.criarLista(novaLista, "");
    user.getLists().then((list: any) => {
      setListPage(list.page);
      setLists(list.results);
      setIsLoadingList(false);
      alert("Lista criada!");
    });
  };

  const handleSearchMovie = async () => {
    if (searchMovie.length < 4) {
      alert("Preencha o campo antes de pesquisar");
      return;
    }
    if (isLoadingMovie) return;
    setIsLoadingMovie(true);
    const filmes = await user.procurarFilme(searchMovie);
    setMovies(filmes.results);
    setIsLoadingMovie(false);
  };

  const handleAddMovieToList = async (selMovie: any) => {
    if (selMovie == 0) return;
    if (isLoadingListMovie) return;
    setIsLoadingListMovie(true);
    const filmesLista = await user.adicionarFilmeNaLista(selMovie.id, selList);
    console.log(filmesLista);
    await loadListMovies(selList);
    setIsLoadingListMovie(false);
  };

  const handleSelectList = async (selectList: SelectChangeEvent<number>) => {
    if (selectList.target.value == 0) return;
    setSelList(Number(selectList.target.value));
    const listName = lists.find((l) => {
      return l.id == selectList.target.value;
    });
    if (listName) setSelListName(listName.name);
    await loadListMovies(Number(selectList.target.value));
  };

  const loadListMovies = async (listId: number) => {
    if (isLoadingListMovie) return;
    setIsLoadingListMovie(true);
    const filmesLista = await user.pegarLista(listId);
    setListMovies(filmesLista.items);
    setIsLoadingListMovie(false);
  };

  return (
    <Box
      m={2}
      pt={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "60%",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Página inicial
      </Typography>
      <Box
        sx={{
          border: "1px solid lightgrey",
          borderRadius: "5px",
          padding: "1rem",
          width: "100%",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          Listas de filmes
        </Typography>
        <FormGroup
          row
          sx={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Select
            name={selListName}
            value={selList}
            label="Lista de filmes"
            onChange={(e) => handleSelectList(e)}
            sx={{
              width: "40%",
            }}
          >
            <MenuItem value={0}>Selecione uma lista</MenuItem>
            {lists.length > 0
              ? lists.map((list: any) => {
                  return (
                    <MenuItem key={list.id} value={list.id}>
                      {list.name}
                    </MenuItem>
                  );
                })
              : null}
          </Select>
          <TextField
            variant="standard"
            placeholder="Crie uma nova lista"
            sx={{ width: "40%" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNewList();
              }
            }}
            onChange={(e) => setNovaLista(e.target.value)}
          />
          <LoadingButton
            loading={isLoadingList}
            variant="outlined"
            onClick={handleNewList}
          >
            Salvar
          </LoadingButton>
        </FormGroup>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Filmes
      </Typography>
      <Box
        sx={{
          border: "1px solid lightgrey",
          borderRadius: "5px",
          padding: "1rem",
          width: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: "5px",
            padding: "1rem",
            width: "90%",
          }}
        >
          <FormGroup
            row
            sx={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <TextField
              variant="standard"
              placeholder="Busque um filme"
              sx={{ width: "70%" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchMovie();
                }
              }}
              onChange={(e) => setSearchMovie(e.target.value)}
            />
            <LoadingButton
              loading={isLoadingMovie}
              variant="outlined"
              onClick={handleSearchMovie}
            >
              Pesquisar
            </LoadingButton>
          </FormGroup>
          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {movies.length > 0
              ? movies.map((movie: any) => {
                  return (
                    <ListItem
                      key={movie.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="addToList"
                          onClick={() => {
                            handleAddMovieToList(movie);
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={`${baseUrlAvatar}${movie.backdrop_path}`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={movie.title}
                        secondary={movie.original_title}
                      />
                    </ListItem>
                  );
                })
              : null}
          </List>
        </Box>
        <Box
          sx={{
            border: "1px solid lightgrey",
            borderRadius: "5px",
            padding: "1rem",
            width: "90%",
          }}
        >
          <Typography variant="h6" component="h4" gutterBottom>
            {lists.length > 0 && selList != 0
              ? "Filmes da lista " + selListName
              : ""}
          </Typography>

          <List
            sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          >
            {listMovies && listMovies.length > 0
              ? listMovies.map((movie: any) => {
                  return (
                    <ListItem
                      key={movie.id}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="removeFromList"
                          onClick={() => {
                            handleAddMovieToList(movie);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={`${baseUrlAvatar}${movie.backdrop_path}`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={movie.title}
                        secondary={movie.original_title}
                      />
                    </ListItem>
                  );
                })
              : null}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
