import { Button, Container, Card, CardContent, CardActions, Stack, Typography, TextField } from "@mui/material"
import CardTitle from "../../components/CardTitle";
import QuestionMarkIcon from '@mui/icons-material/QuestionMarkRounded';
import { Link } from "react-router-dom";
import HomeIcon from '@mui/icons-material/HomeRounded';

function NotFound() {
    return (
        <Container maxWidth="xl" sx={{marginTop: "1rem"}}>
            <Card sx={{ maxWidth: 500, margin: "auto" }}>
                <CardContent>
                    <CardTitle icon={<QuestionMarkIcon />} title="Page Not Found" />
                    <Typography variant="body1" component="div" sx={{ flexGrow: 1, mt: 3 }}>
                        The page you are looking for does not exist. Please check the URL and try again.
                    </Typography>
                    <Button fullWidth variant="contained" sx={{mt: "1rem"}} component={Link} to="/" startIcon={<HomeIcon />}>Return Home</Button>
                </CardContent>
            </Card>

        </Container>
    )
}

export default NotFound