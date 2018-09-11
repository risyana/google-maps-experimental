/* CONSTANT */
const ATTRACTIONS = '../data/data.json';
const LAT_LNG = [1.2922997, 103.8571885];
const ZOOM_IN = 17;
const ZOOM_INIT = 15;

/* MODEL */
const data = {
  dataGlobal: '', // data from json file
  mapGlobal: '', // google maps
  markersGlobal: '', // google maps markers
  mapCenterGlobal: '', // default center of goole maps
  markerIcon: '',
  markerIconBigger: '',
  isDrawerOpen: false,
};

/* OCTOPUS */
const controller = {

  setAttractionData: async () => {
    let result = await fetch(ATTRACTIONS);
    result = await result.json();
    data.dataGlobal = result.data;
  },

  getAttractionData: () => data.dataGlobal,

  getDetailAttraction: (id) => {
    const selectedMarker = data.markersGlobal.filter((marker) => {
      return marker.id === id.toString();
    });

    data.mapGlobal.setCenter(selectedMarker[0].marker.getPosition());
    data.mapGlobal.setZoom(ZOOM_IN);

    const attr = data.dataGlobal.filter((attraction) => {
      return attraction.id === id.toString();
    });
    return attr[0];
  },

  createMap: () => {
    const mapProp = {
      zoom: ZOOM_INIT,
      center: data.mapCenterGlobal,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    return new google.maps.Map(document.getElementById('maps'), mapProp);
  },

  createMarker: () => {
    return data.dataGlobal.map((elm) => {
      const markerProp = {
        map: data.mapGlobal,
        position: new google.maps.LatLng(elm.loc.lat, elm.loc.lng),
        icon: data.markerIcon,
        labelContent: elm.name,
        labelAnchor: new google.maps.Point(12, 44),
        labelClass: 'marker_label_default', // your desired CSS class
        labelInBackground: true,
      };

      // handling IE 11 & Edge if user press 'reload' button in the browser.
      if (typeof MarkerWithLabel === 'undefined') {
        window.location.href = window.location.href;
      }

      // create marker with label
      let marker = new MarkerWithLabel(markerProp);

      // add envent listner
      marker = controller.setListenerToMarkers(marker, elm.id);

      return {
        id: elm.id,
        marker,
      };
    });
  },

  setListenerToMarkers: (marker, id) => {
    marker.addListener('click', () => {
      controller.clickAttractionHanlder(id);
      data.mapGlobal.setCenter(marker.getPosition());
    });
    marker.addListener('mouseover', () => {
      marker.set('icon', data.markerIconBigger);
      marker.set('labelClass', 'marker_label_mouseover');
      marker.set('labelAnchor', new google.maps.Point(25, 100));
    });
    marker.addListener('mouseout', () => {
      marker.set('icon', data.markerIcon);
      marker.set('labelClass', 'marker_label_default');
      marker.set('labelAnchor', new google.maps.Point(12, 44));
    });

    return marker;
  },

  clickAttractionHanlder: (id) => {
    controller.backToInitialZoomCenter();
    setTimeout(() => {
      data.mapGlobal.setZoom(ZOOM_IN);
      view.displayDetailAttraction(id);
    }, 400);
  },

  backToInitialZoomCenter: () => {
    data.mapGlobal.setCenter(data.mapCenterGlobal);
    data.mapGlobal.setZoom(ZOOM_INIT);
    view.closeDetailAttraction();
  },

  toggleDrawer: () => {
    data.isDrawerOpen = !data.isDrawerOpen;
  },

  init: async () => {
    await controller.setAttractionData();
    data.mapGlobal = await controller.createMap();
    data.markersGlobal = await controller.createMarker();
    view.init();
  },
};

/* VIEW */
const view = {

  displayAttractions: () => {
    const linkContainer = document.querySelector('.attraction-list');
    const linkTemplate = document.querySelector('script[data-template="attraction"]').innerHTML;
    const drawer = document.querySelector('div.drawer');

    const attractions = controller.getAttractionData();

    linkContainer.innerHTML = '';
    drawer.innerHTML = '';

    attractions.forEach((attr) => {
      const link = linkTemplate
        .replace(/{{id}}/g, attr.id)
        .replace(/{{name}}/g, attr.name);
      linkContainer.insertAdjacentHTML('beforeend', link);
      drawer.insertAdjacentHTML('beforeend', link);
    });
  },

  displayDetailAttraction: (id) => {
    const informationBar = document.querySelector('div.informationBar');
    const detailTemplate = document.querySelector('script[data-template="detailInformation"]').innerHTML;
    const mapContainer = document.querySelector('div.mapContainer');
    const attr = controller.getDetailAttraction(id);

    view.closeDetailAttraction();

    const detailAttraction = detailTemplate
      .replace(/{{id}}/g, attr.id)
      .replace(/{{name}}/g, attr.name)
      .replace(/{{desc}}/g, attr.desc)
      .replace(/{{address}}/g, attr.address)
      .replace(/{{url}}/g, attr.url);

    setTimeout(() => {
      mapContainer.style.height = '60vh';
      informationBar.style.width = '100%';
      informationBar.style.height = '100%';
      informationBar.innerHTML = '';
      informationBar.insertAdjacentHTML('beforeend', detailAttraction);
    }, 500);
  },

  closeDetailAttraction: () => {
    const informationBar = document.querySelector('div.informationBar');
    informationBar.style.height = 0;
    informationBar.style.width = 0;
    informationBar.innerHTML = '';
  },

  clickBurgerIconHandler: () => {
    const drawer = document.querySelector('div.drawer');
    const backdrop = document.querySelector('div.backdrop');
    controller.toggleDrawer();
    drawer.style.left = data.isDrawerOpen ? '0' : '-200px';
    backdrop.style.display = data.isDrawerOpen ? 'block' : 'none';
  },

  init: () => {
    view.displayAttractions();
  },
};

/* Google Maps callback */
function initMap() {
  data.mapCenterGlobal = new google.maps.LatLng(LAT_LNG[0], LAT_LNG[1]);

  data.markerIcon = {
    url: 'image/svg/location.svg',
    scaledSize: new google.maps.Size(50, 50),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(26, 50),
  };
  data.markerIconBigger = {
    url: 'image/svg/location.svg',
    scaledSize: new google.maps.Size(120, 120),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(60, 120),
  };
}

controller.init();
