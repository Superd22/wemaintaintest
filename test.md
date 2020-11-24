# Technical test - WeMaintain

The dataset provided in the `data` folder was extracted from SongKick and has a list of bands, venues, and concerts from those bands at those venues.

- `bands.json` : List of bands (`id` and `name`)
- `venues.json` : List of places with `id`, `name`, and coordinates `latitude`/`longitude`
- `concerts.json` : list of concerts with `venueId`, `bandId` and `date` (UNIX timestamp in miliseconds)

## Step 1

The first step of the exercise is to develop a single API Endpoint that returns the concerts matching the criterias given by the user. The architecture around that endpoint is 
left entirely up to the engineer (interface, database ...).
The endpoint should accept the four filters below as parameters

```
concerts

bandIds: String - Comma separated list of bandIds
latitude: float
longitude: float
radius: Int - In kilometers 
```

- The user must at least provide `bandIds` *OR* `latitude`/`longitude`/`radius` (But can provide all the fields too)
- Providing incorrect values should return an error
- The endpoint must return a JSON array of matching events sorted by descending date with the following format :

```json
    {
        "band": "Radiohead",
        "location": "Point Ephémère, Paris, France",
        "date": 1569531810650,
        "latitude": 48.8814422,
        "longitude": 2.3684356
    }
```

## Step 2
For the previous step, we had 1400 bands across 376 venues, and around 20,000 events. For this step, we ask that you document in your `README.md` how you would architecture your solution if you now had 2 million bands, 10,000 venues, and 200 million events.

Describe in detail how you would store and query the data, and what kind of mechanism you would leverage to consistently deliver short response times and guarantee the highest uptime possible.

Please then answer the two following questions : 

- What do you identify as possible risks in the architecture that you described in the long run, and how would you mitigate those?
- What are the key elements of your architecture that would need to be monitored, and what would you use to monitor those?

# Requirements

- Your repository should include a `README` file that describes the steps to run your project.
- The whole stack is up to you. Feel free to use any API or third-party library.

Once you are done, please share a link to your repository

We will also take the following into consideration :

- Maintainability of the solution
    - Code linting, test coverage..
    - Documentation
    - Clean code
- Creativity
- Sensibility for scalability and clean architecture
