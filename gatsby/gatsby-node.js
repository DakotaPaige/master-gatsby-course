import path, { resolve } from 'path';
import fetch from 'isomorphic-fetch';
import beersData from './src/data/beers.json';

async function turnPizzasIntoPages({ graphql, actions }) {
  // Get the template
  const pizzaTemplate = path.resolve('./src/templates/Pizza.js');

  // Query all pizzas
  const { data } = await graphql(`
    query {
      pizzas: allSanityPizza {
        nodes {
          name
          slug {
            current
          }
        }
      }
    }
  `);

  // Loop through the pizzas and create a page for each
  data.pizzas.nodes.forEach((pizza) => {
    actions.createPage({
      path: `pizza/${pizza.slug.current}`,
      component: pizzaTemplate,
      context: {
        slug: pizza.slug.current,
      },
    });
  });
}

async function turnToppingsIntoPages({ graphql, actions }) {
  // Get the template
  const toppingsTemplate = path.resolve('./src/pages/pizzas.js');

  // Query all toppings
  const { data } = await graphql(`
    query {
      toppings: allSanityTopping {
        nodes {
          name
          id
        }
      }
    }
  `);

  // Loop through the pizzas and create a page for each
  data.toppings.nodes.forEach((topping) => {
    actions.createPage({
      path: `topping/${topping.name}`,
      component: toppingsTemplate,
      context: {
        topping: topping.name,
        toppingRegex: `/${topping.name}/i`,
      },
    });
  });
}

async function fetchBeersAndTurnIntoNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  // Fetch a list of beers
  // SampleaAPIs.com stopped working, so i copied the data and put it into a data file temporarily.
  // const res = await fetch('https://api.sampleapis.com/beers/ale');
  // const beers = await res.json();

  const beers = beersData.ale;

  // Loop over each one
  for (const beer of beers) {
    // create a node for each beer

    if (beer.rating.average) {
      const nodeMeta = {
        id: createNodeId(`beer-${beer.name}`),
        parent: null,
        children: [],
        internal: {
          type: 'Beer',
          mediaType: 'application/json',
          contentDigest: createContentDigest(beer),
        },
      };

      // Create a node for that beer
      actions.createNode({
        ...beer,
        ...nodeMeta,
      });
    }
  }
}

async function turnSlicemastersIntoPages({ graphql, actions }) {
  // Query all slicemasters
  const { data } = await graphql(`
    query {
      slicemasters: allSanityPerson {
        totalCount
        nodes {
          name
          id
          slug {
            current
          }
        }
      }
    }
  `);

  // Turn each slicemaster into their own page
  data.slicemasters.nodes.forEach((slicemaster) => {
    actions.createPage({
      component: resolve('./src/templates/SliceMaster.js'),
      path: `/slicemaster/${slicemaster.slug.current}`,
      context: {
        name: slicemaster.person,
        slug: slicemaster.slug.current,
      },
    });
  });

  // Figure out how many pages there are based on how many slicemasters there are and how many per page
  const pageSize = parseInt(process.env.GATSBY_PAGE_SIZE);
  const pageCount = Math.ceil(data.slicemasters.totalCount / pageSize);

  // Loop over 1 to n and create pages for them
  Array.from({ length: pageCount }).forEach((_, i) => {
    actions.createPage({
      path: `/slicemasters/${i + 1}`,
      component: path.resolve('./src/pages/slicemasters.js'),
      // this data is passed to the template when created
      context: {
        skip: i * pageSize,
        currentPage: i + 1,
        pageSize,
      },
    });
  });
}

export async function sourceNodes(params) {
  // fetch a list of beers and source them into our Gatsby API
  await Promise.all([fetchBeersAndTurnIntoNodes(params)]);
}

export async function createPages(params) {
  // Creating pages dynamically for pizzas, toppings & slicemasters
  // Wait for all promises to be resolved before finishing this function
  await Promise.all([
    turnPizzasIntoPages(params),
    turnToppingsIntoPages(params),
    turnSlicemastersIntoPages(params),
  ]);
}
