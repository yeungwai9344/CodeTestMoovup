import React from "react";
import { useState, useEffect } from 'react';
import { FixedSizeList, ListChildComponentProps } from "react-window";
import useWindowsDimensions from "../components/useWindowsDimensions";

import {
  GoogleMaps,
  GoogleMapsWrapper,
  Layout,
} from "../components";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

var styleBackground = {
  display: 'flex',
  justifyContent: 'center',
  height: "100vh",
  width: "100%", 
}
var styleBlocking = {
  position: "absolute",
  top: "0px",
  bottom: "0px",
  left: "0px",
  right: "0px",
  backgroundColor: "grey", 
  opacity: "0.8",
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: "center"
} as const

var styleView = {
  height: "100%",
  width: "100%", 
  maxWidth: "500px", 
  marginLeft: "20px",
  marginRight: "20px",
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
} as const

var styleMap = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%", 
}

var txtStyleTitle = {
  fontSize: "0.8em",
  fontFamily: "Arial",
  marginBottom: "0",
}

var txtStyleListName = {
  fontSize: "1em",
  fontFamily: "Arial",
  margin: "0",
}
var txtStyleListEmail = {
  fontSize: "0.8em",
  fontFamily: "Arial",
  margin: "0",
}
var txtStyleListWarn = {
  color: "red",
  fontSize: "0.6em",
  fontFamily: "Arial",
  margin: "0",
}

var txtStyleAlert = {
  color: "White",
  fontSize: "1em",
  fontFamily: "Arial",
  margin: "0",
}



function App(){
  const [selected, setSelected] = useState(null);
  const [posts, setPosts] = useState([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const { height, width } = useWindowsDimensions();
  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(true);

  // fetch list, make marker and store in state for map use
  useEffect(() => {
    fetch('https://api.json-generator.com/templates/-xdNcNKYtTFG/data', 
    {    
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer b2atclr0nk1po45amg305meheqf4xrjt9a1bo410`, 
      },
    })
       .then((res) => res.json())
       .then((data) => {
          // sort by location valid -> name a-z
          data.sort((a: any, b: any) => {
            let aLoc = a.location?.latitude && a.location?.longitude
            let bLoc = b.location?.latitude && b.location?.longitude
            let deltaName = (a.name?.first+a.name?.last) > (b.name?.first+b.name?.last)
            if (!aLoc && bLoc) return 1
            if (aLoc && !bLoc) return -1
            return deltaName ? 1 : -1
          })

          // create marker
          const arr = []
          for (var i=0;i<data.length; i++) {
            let hasMarker = data[i].location?.latitude != null && data[i].location?.longitude != null
            if (hasMarker) {
              let marker = new google.maps.Marker({
                position: new google.maps.LatLng({
                  lat: data[i].location?.latitude, // might be null
                  lng: data[i].location?.longitude,
                }),
              });

              // put into contact list
              data[i].marker = marker
              arr.push(marker)
            }
          }

          //save
          setPosts(data);
          setMarkers(arr)

       })
       .catch((err) => {
          console.log(err.message);
          setEnable(false)
       });
  }, []);

  // listview row generating
  function renderRow(props: ListChildComponentProps) {
    const { index, style } = props;
    var hasMark = posts[index]["marker"]!=null
    var name = posts[index]["name"]["first"] + " " + posts[index]["name"]["last"]
    var email = posts[index]["email"]
    return (
      <ListItem style={style} key={index} component="div" disablePadding>
        <ListItemButton onClick={()=>{
          // onclick -> pan camera to gps, toggle its infoview
          if (!hasMark || selected===posts[index]) {
            setSelected(null)
          } else {
            setSelected(posts[index])
          }
        }}>
            <p>
            <ListItemText style={{margin: "0"}} primary={<p style={txtStyleListName}>{name}</p>} />
            <ListItemText style={{margin: "0"}} primary={<p style={txtStyleListEmail}>{email}</p>} />
            {!hasMark && <ListItemText style={{margin: "0"}} primary={<p style={txtStyleListWarn}>Location not available</p>} /> }
            </p>
        </ListItemButton>
      </ListItem>
    );
  }
  return (
    <div style={styleBackground}>
      <div style={styleView}>
          <div style={styleMap}><GoogleMapsWrapper><Layout>
                <GoogleMaps height={height?height*0.6:400} selectedUser={selected} markers={markers} />
          </Layout></GoogleMapsWrapper></div>
          <div />
          <p style={txtStyleTitle}>Bears</p>
          <div style={{backgroundColor:"lightgray", width:"100%", height:"2px"}}></div>
          <FixedSizeList
            style={{marginTop: "5px"}}
            height={200}
            width={"100%"}
            itemSize={70}
            itemCount={posts.length}
            overscanCount={5}
          >
            {renderRow}
          </FixedSizeList>
        </div>
        {enable ? null : <div style={styleBlocking}> <p style={txtStyleAlert}>Failed to fetch the list. Please retry later</p> </div>}

    </div>
  );
}
export default App;
