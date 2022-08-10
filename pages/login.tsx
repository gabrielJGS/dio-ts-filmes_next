import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import User from "../models/User";
import { useRouter } from "next/router";

import { TextField, Button, Box, Typography, Alert } from "@mui/material";

const Login: NextPage = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleLogin = async () => {
    const user = new User(login, password, apiKey);
    await user.criarRequestToken().then(() => {
      user.logar().then(() => {
        user
          .criarSessao()
          .then(() => {
            user.getDetails().then(() => {
              console.log(user)
              alert("Login realizado com sucesso");
              localStorage.setItem("user", JSON.stringify(user));
              router.push("./");
            });
          })
          .catch((e: ErrorEvent) => {
            console.log(e);
            setErrorMsg(e.message);
          });
      });
    });
  };

  useEffect(() => {
    const exists = localStorage.getItem("user");
    if (exists) router.push("./");
  }, []);
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
      {errorMsg.length > 0 ? <Alert severity="error">{errorMsg}</Alert> : null}
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <TextField
        fullWidth
        label="Login"
        variant="outlined"
        margin="dense"
        onChange={(e) => setLogin(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        margin="dense"
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        fullWidth
        label="Api Key"
        variant="outlined"
        margin="dense"
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Button variant="contained" onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
};

export default Login;
