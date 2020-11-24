## Installation

** Make sure that port 4000 and 3000 are available. **

npm install
npm run dev

app url: http://localhost:4000/search
    Search route:
        method: POST
        header: Content-Type: application/json

json server url: http://localhost:3000

## Step 1

### Case 1 example
{
    "bandIds": "1,2,3"
}

### Case 2 example
{
    "latitude": 43.5,
    "longitude": -79.3,
    "radius": 50
}

### Case 3 example
{
    "bandIds": "1,2,3",
    "latitude": 43.5,
    "longitude": -79.3,
    "radius": 50
}

## Step 2

Describe in detail how you would store and query the data, and what kind of mechanism you would leverage to consistently deliver short response times and guarantee the highest uptime possible.

The bottleneck is obviously the search by geo coordinates. An elesticsearch engine would easily answer the need to consistently deliver short response times. It would make easy the search of flattened data with precise criteria such as longitude and latitude. It also mean that it would not be required to call severals REST routes due to relationships, in order to compute the whole data to return. 
For the uptime, replication of elasticsearch would be needed. As well as load balancing to choose carefully what node to hit.

Please then answer the two following questions : 

- What do you identify as possible risks in the architecture that you described in the long run, and how would you mitigate those?

Elasticsearch is not a good technology as primary database because of some possible instabilities. Plus it is not made for models with relationship. It means that another database need to be maintainm probably a MariaDB in this case. And a system to index new data and redindex the whole database(in case of complete lost of data from elasticsearch and no possibilities to recover from other nodes or backup) flatened data from the MariaDB into the elasticsearch. It also means that monitoring and ops skill is needed on a daily baisis, which is costful and not that easy to do properly. On top of that it means that additionnals system need to be put in place for monitoring and alerting such as datadog/grafana or any alternatives.

- What are the key elements of your architecture that would need to be monitored, and what would you use to monitor those?

As said above, regarding monitoring tools such as datadog/grafana. The part to monitor on my opinion would be the consistency of the data in the elasticsearch, the average response time of the engine and that everything is up and running properly on an infrastructure level.

