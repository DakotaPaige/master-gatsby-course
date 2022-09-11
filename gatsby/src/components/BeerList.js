import React from 'react';
import styled from 'styled-components';

const BeerList = ({ beers }) => (
  <Root>
    {beers.map((beer) => {
      const rating = Math.round(beer.rating.average);
      return (
        <Beer key={beer.id}>
          <img src={beer.image} alt={beer.name} />
          <p>{beer.name}</p>
          <p>{beer.price}</p>
          <p title={`${rating} Out of 5 stars`}>
            {`⭐️`.repeat(rating)}
            <span style={{ filter: 'grayscale(100%)' }}>
              {`⭐️`.repeat(5 - rating)}
            </span>
            <span>({beer.rating.reviews})</span>
          </p>
        </Beer>
      );
    })}
  </Root>
);

const Root = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
`;

const Beer = styled.div`
  border: 1px solid var(--grey);
  padding: 2rem;
  text-align: center;
  img {
    width: 100%;
    height: 200px;
    object-fit: contain;
    display: grid;
    align-items: center;
    font-size: 10px;
  }
`;

export default BeerList;
