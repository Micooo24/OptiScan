import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box } from '@mui/material';
import UserNavBar from '../layouts/UserNavBar';

import macularImg from '../../assets/macular.jpg';
import lazyImg from '../../assets/lazy.png';
import astigImg from  '../../assets/astigmatism.jpg';
import cataractImg from '../../assets/cataract.jpeg';
import clrblndImg from '../../assets/clrblnd.jpg';
import diabeticImg from '../../assets/diabetic.jpg';
import dryImg from  '../../assets/dry.jpg';
import floatersImg from '../../assets/floaters.jpg';
import glaucomaImg from '../../assets/glaucoma.png';
import pinkImg from '../../assets/pink.jpg';
import retinalImg from  '../../assets/retinal.jpg';

const conditions = [
  {
    name: "Age-Related Macular Degeneration",
    img: macularImg,
    desc: "Loss of central vision, common in older adults."
  },
  {
    name: "Amblyopia (Lazy Eye)",
    img: lazyImg,
    desc: "Poor vision in one eye from childhood."
  },
  {
    name: "Astigmatism",
    img: astigImg,
    desc: "Blurred vision from an irregular eye shape."
  },
  {
    name: "Cataracts",
    img: cataractImg,
    desc: "Cloudy lens causing blurry vision."
  },
  {
    name: "Color Blindness",
    img: clrblndImg,
    desc: "Trouble seeing certain colors."
  },
  {
    name: "Diabetic Retinopathy",
    img: diabeticImg,
    desc: "Retina damage from diabetes."
  },
  {
    name: "Dry Eye",
    img: dryImg,
    desc: "Eyes feel dry or irritated."
  },
  {
    name: "Floaters",
    img: floatersImg,
    desc: "Small spots in your vision."
  },
  {
    name: "Glaucoma",
    img: glaucomaImg,
    desc: "High eye pressure can cause vision loss."
  },
  {
    name: "Pink Eye",
    img: pinkImg,
    desc: "Red, itchy, or watery eyes."
  },
  {
    name: "Retinal Detachment",
    img: retinalImg,
    desc: "Retina pulls away, causing sudden vision loss."
  }
];

export default function EyeConditions() {
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #b4c9d7 100%)' }}>
      <UserNavBar />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498db', mb: 4 }}>
          Common Eye Conditions
        </Typography>
.
<Grid container spacing={4}>
  {conditions.map((cond) => (
    <Grid item xs={12} sm={6} md={6} key={cond.name}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: 6,
            cursor: 'pointer'
          }
        }}
      >
        <CardMedia
          component="img"
          height="120"
          image={cond.img}
          alt={cond.name}
          sx={{ objectFit: 'cover', bgcolor: '#e0f2fe' }}
        />
        <CardContent>
          <Typography variant="h6" sx={{ color: '#3498db', fontWeight: 700 }}>
            {cond.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4C566A', mt: 1 }}>
            {cond.desc}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

      </Container>
    </Box>
  );
}