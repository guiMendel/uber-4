export default function Instructions() {
  return (
    <div className="text-panel">
      <h2>Welcome to the Cabber Simulation!</h2>

      <p className="credits-text">
        This application allows you to simulate a city map with taxis and
        clients in real-time.
      </p>

      <h2>Starting the Simulation</h2>

      <p className="credits-text">
        From the "New Map" option, pick how you want the city's streets to be
        initialized. <b>Blank</b> starts from scratch, <b>Random</b> places them
        randomly scattered, and <b>City Blocks</b> generates a grid of streets.
        You'll also be able to customize the street generation parameters if you
        want.
      </p>

      <h2>In the Simulation</h2>

      <p className="credits-text">
        The color of the streets indicate their speed. By default, the bluer,
        the faster. Cars tainted red are the cars that are currently assigned to
        a client's route. Clients will walk to their destination until a car is
        available to pick them up.
      </p>

      <p className="credits-text">
        Use the 3 buttons on lower-right corner to create new clients, streets
        and cars. The buttons on the top-right allow you play/pause the
        simulation, tweak the timescale in real-time, and also toggle the
        auto-assignment of cars to clients and the auto-generation of new
        clients on/off.
      </p>

      <p className="credits-text">
        Select clients to reveal buttons to view and reassign their destination
        and route. If you also select a car, you can force a route with it.
      </p>
    </div>
  )
}
