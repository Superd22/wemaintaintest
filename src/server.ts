import express, { Request, Response  } from 'express';
import bodyParser from 'body-parser';
import joi, { ValidationError } from 'joi';
import { getBoundsOfDistance } from 'geolib';
import axios from 'axios';

const app = express();
const port = 4000;

interface Band {
  id: number,
  name: string
}

interface Concert {
  bandId: number,
  venueId: number,
  date: number
}

interface Venue {
  id: number,
  name: string,
  latitude: number,
  longitude: number
}

class Event {
  band: Band | null;
  concert: Concert;
  venue: Venue | null;

  constructor(concert: Concert, band: Band | null = null, venue: Venue | null = null) {
    this.band = band;
    this.concert = concert;
    this.venue = venue;
  }

  serialize() {
    if (!this.band || !this.venue) {
      throw new Error('Missing data in order to serialize Event object');
    }

    return {
      band: this.band.name,
      location: this.venue.name,
      date: this.concert.date,
      latitude: this.venue.latitude,
      longitude: this.venue.longitude
    }
  }
}

interface Body { 
  bandIds?: string, 
  latitude?: number, 
  longitude?: number, 
  radius?: number
}

interface normalizedBody { 
  bandIds: number[], 
  latitude?: number, 
  longitude?: number, 
  radius?: number
}

const normalizeBody = (body: Body) : normalizedBody => {
  const normalizedBody: normalizedBody = {
    ...body,
    ...{ bandIds: [] }
  };

  if (typeof body === 'object'
    && typeof body.bandIds === 'string'
  ) {
    normalizedBody.bandIds = body.bandIds.split(',').map(id => parseInt(id));
  }

  if (typeof body === 'object'
    && typeof body.radius === 'number'
  ) {
    normalizedBody.radius = body.radius * 1000;
  }

  return normalizedBody;
}

const sortByDate = (a: Event, b: Event) => {
  if (a.concert.date > b.concert.date) {
    return -1;
  }
  if (a.concert.date < b.concert.date) {
    return 1;
  }

  return 0;
};

const schema = joi.object({
  bandIds: joi.string().regex(/^(\d+)(,\d+){0,}$/),
  latitude: joi.number(),
  longitude: joi.number(),
  radius: joi.number()
}).or('bandIds', 'latitude', 'longitude', 'radius')
  .and('latitude', 'longitude', 'radius')
  .options({abortEarly : false});

app.use(bodyParser.json())
app.post( "/search", async ( req: Request, res: Response ) => {
  try {
    const { error, value } : { error?: ValidationError, value: Body } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const normalizedBody = normalizeBody(value);
    let events: Event[] = [];

    if (undefined !== normalizedBody.latitude 
      && undefined !== normalizedBody.longitude 
      && undefined !== normalizedBody.radius
    ) {
      const { latitude, longitude, radius } = normalizedBody;
      const bounds = getBoundsOfDistance(
        { lng: longitude, lat: latitude },
        radius
      );

      const [minBounds, maxBounds] = bounds;
      const data: Venue[] = await axios.get('http://localhost:3000/venues').then(res => res.data);

      const squaredVenues = data.filter((venue: Venue) => 
      venue.latitude > minBounds.latitude 
            && venue.latitude < maxBounds.latitude
            && venue.longitude > minBounds.longitude
            && venue.longitude < maxBounds.longitude
      );

      events = (await Promise.all(squaredVenues.map(async (venue: Venue): Promise<Event[]> => 
        axios.get(`http://localhost:3000/venues/${venue.id}/concerts`).then((res) => { 
          const concerts: Concert[] = res.data;

          return concerts.map((concert: Concert) => new Event(concert, null, venue));
        })
      ))).reduce((acc, events: Event[] ) =>  acc.concat(events), []);

      if (0 !== normalizedBody.bandIds.length) {
        events = events.filter((event: Event) => 
          normalizedBody.bandIds.includes(event.concert.bandId)
        );
      }

      events = (await Promise.all(events.map(async (event: Event): Promise<Event> => 
        axios.get(`http://localhost:3000/bands/${event.concert.bandId}`).then((res) => {
          event.band = res.data;

          return event;
        })
      )))

      return res.json(events.sort(sortByDate).map((event: Event) => event.serialize()));
    }

    if (0 === normalizedBody.bandIds.length) {
      return res.status(500).json({ error: 'invalid request' });
    }


    const bands: Band[] = (await Promise.all(normalizedBody.bandIds.map(async (bandId: number) => 
      axios.get(`http://localhost:3000/bands/${bandId}`).then(res=> res.data)
    )));

    events = (await Promise.all(bands.map(async (band: Band): Promise<Event[]> => 
      axios.get(`http://localhost:3000/bands/${band.id}/concerts`).then(res => {
        const concerts: Concert[] = res.data;

        return concerts.map((concert: Concert) => new Event(concert, band));
      })
    ))).reduce((acc, events: Event[] ) =>  acc.concat(events), []);

    events = (await Promise.all(events.map(async (event: Event): Promise<Event> => 
      axios.get(`http://localhost:3000/venues/${event.concert.venueId}`).then(res => {
        const venue = res.data;
        event.venue = venue;

        return event;
      })
    )))

    return res.json(events.sort(sortByDate).map((event: Event) => event.serialize()));
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

// start the Express server
app.listen( port, () => {
  console.log( `server started at http://localhost:${ port }` );
});