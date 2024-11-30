import { useEffect } from "react";
import { Container, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import Infobox from "../components/InfoBox";
import http from "../http";
import titleHelper from "../functions/helpers";
import PageHeader from "../components/PageHeader";
import { QuestionMarkRounded } from "@mui/icons-material";
import { get } from "aws-amplify/api";

function Test() {
  titleHelper("Test Page")

  function test() {
    http.get("User/Test").then((res) => {
      console.log(res.data);
    }
    ).catch((err) => {
      console.log(err);
    })
  }

  const handleNormalTest = () => {
    get({
      apiName: "midori",
      path: "/test/normal",
    }).then((res) => {
      enqueueSnackbar("Normal test successful", { variant: "success" });
      console.log(res)
    }).catch((err) => {
      enqueueSnackbar("Normal test failed", { variant: "error" });
      console.log(err)
    })
  }

  return (
    <>
      <PageHeader title="Test Page" icon={QuestionMarkRounded} background={"./homepage_hero.jpg"} />
      <Container maxWidth="xl" sx={{ marginY: "1rem" }}>

        <h1>Test</h1>
        <p>Welcome to the test page</p>
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
        <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
        <Button variant="contained" color="primary" onClick={test}>Test some shit</Button>
        <Infobox pending title="Pending Infobox" value="Pending" boolean={false} />

        <Box sx={{ mt: "1rem" }}>
          <Button variant='contained' onClick={handleNormalTest}>Test Normal</Button>
          <Button variant='contained'>Test Admin</Button>
          <Button variant='contained'>Test Farmer</Button>
        </Box>
      </Container>
    </>

  );
}

export default Test;
