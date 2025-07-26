import React from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material';

const conditions = [
  {
    name: "Age-Related Macular Degeneration",
    img: "https://via.placeholder.com/120",
    desc: "Loss of central vision, common in older adults."
  },
  {
    name: "Amblyopia (Lazy Eye)",
    img: "https://via.placeholder.com/120",
    desc: "Poor vision in one eye from childhood."
  },
  {
    name: "Astigmatism",
    img: "https://via.placeholder.com/120",
    desc: "Blurred vision from an irregular eye shape."
  },
  {
    name: "Cataracts",
    img: "https://via.placeholder.com/120",
    desc: "Cloudy lens causing blurry vision."
  },
  {
    name: "Color Blindness",
    img: "https://via.placeholder.com/120",
    desc: "Trouble seeing certain colors."
  },
  {
    name: "Diabetic Retinopathy",
    img: "https://via.placeholder.com/120",
    desc: "Retina damage from diabetes."
  },
  {
    name: "Dry Eye",
    img: "https://via.placeholder.com/120",
    desc: "Eyes feel dry or irritated."
  },
  {
    name: "Floaters",
    img: "https://via.placeholder.com/120",
    desc: "Small spots in your vision."
  },
  {
    name: "Glaucoma",
    img: "https://via.placeholder.com/120",
    desc: "High eye pressure can cause vision loss."
  },
  {
    name: "Pink Eye",
    img: "https://via.placeholder.com/120",
    desc: "Red, itchy, or watery eyes."
  },
  {
    name: "Retinal Detachment",
    img: "https://via.placeholder.com/120",
    desc: "Retina pulls away, causing sudden vision loss."
  }
];

export default function EyeConditions() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498db', mb: 4 }}>
        Common Eye Conditions
      </Typography>
      <Grid container spacing={4}>
        {conditions.map((cond) => (
          <Grid item xs={12} sm={6} md={6} key={cond.name}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
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
  );
}