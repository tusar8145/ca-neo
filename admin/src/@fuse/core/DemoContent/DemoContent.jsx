import { memo } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
 import Container from '@mui/material/Container';
/**
 * DemoContent is a React component used to render a demo content on the page.
 * It renders a image on the page followed by a heading, some text and a footer.
 * It also renders a quote and some content about a person being transformed into a vermin.
 */
function DemoContent() {
	return (

		<React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm">
       
	  <div>

<h4 className="pb-12 font-medium">Demo Content</h4>


<Card sx={{ minWidth: 275 }}>
<CardContent>
<Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
Word of the Day
</Typography>


<Typography sx={{ mb: 1.5 }} color="text.secondary">
adjective
</Typography>
<Typography variant="body2">
well meaning and kindly.
<br />
{'"a benevolent smile"'}
</Typography>
</CardContent>
<CardActions>
<Button size="small">Learn More</Button>
</CardActions>
</Card>


<p>
	<Button variant="contained" color="success">
		Success
	</Button>
</p>
</div>

      </Container>
    </React.Fragment>


		
	);
}

export default memo(DemoContent);
