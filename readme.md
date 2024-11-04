## AR Tour Guide live at [link](https://dhsrthn.github.io/arvr)

    Use a mobile for the best experience 

### Demo video can be found at [link](https://www.youtube.com/watch?v=OqKNpfwWpxU)
![thumbnail](./thumbnail.png)

### Three Modes 

1) Example Mode 
    
    This mode places markers right next to you, which, upon clicking, gives a placeholder description.

2) JSON Mode 

    This mode lets a user upload a JSON file of an array of objects in each of the schema:

    ``` 
    {
        name: <name>,
        location: {
            lat: <latitude>,
            lng: <longitude>,
        },
        desc: <description>
    }
    ```
    A marker will be placed at each location defined in the file.

3) API Mode 

    This mode calls an external Rest API to get famous places nearby and places a marker at each location.


        Note: The markers sometimes only fire a click event to display the description when placed at the center of the screen.

##### Disclaimer 

    The API mode won't be functional in the application hosted right now, due to the API being a paid service. 
