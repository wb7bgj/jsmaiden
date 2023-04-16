// This module contains a set of eight functions that provide calculations related
// to the Maidenhead Grid Locator System used world wide by the Amateur Radio
// community. Refer to the readme.md file for information on the Maidenhead Grid
// Locator System and the usage of the jsmaiden module.
//
// Written by: Kevin Hallquist, WB7BGJ


// Regular expression for matching 2, 4, 6, 8 or 10 digit
// grid ID string. E.g. "AR", "AR09", "AR09ax", "AR09ax09", "AR09ax09AX"
// Persist regular expression patterns to avoid re-compiling on every call
const grid_location_pattern_AR = /^[A-R]{2}$/;
const grid_location_pattern_AR09 = /^[A-R]{2}[0-9]{2}$/;
const grid_location_pattern_AR09ax = /^[A-R]{2}[0-9]{2}[a-x]{2}$/;
const grid_location_pattern_AR09ax09 = /^[A-R]{2}[0-9]{2}[a-x]{2}[0-9]{2}$/;
const grid_location_pattern_AR09ax09AX = /^[A-R]{2}[0-9]{2}[a-x]{2}[0-9]{2}[A-X]{2}$/;


// ====================================================================
// Validates correct format of a given grid ID.
// Input parameter: 2, 4, 6, 8 or 10 character grid locator character string
// Returns: True or False
function grid_location_valid_ID(gl_id) {

    // Use the regular expression to valid the format of the given grid ID 
    if (gl_id.length % 2 === 0 && gl_id.length >= 2 && gl_id.length <= 10) {
        if (gl_id.length === 2) {
            if (grid_location_pattern_AR.test(gl_id)) {
                return true;
            } else {
                return false;
            }
        } else if (gl_id.length === 4) {
            if (grid_location_pattern_AR09.test(gl_id)) {
                return true;
            } else {
                return false;
            }
        } else if (gl_id.length === 6) {
            if (grid_location_pattern_AR09ax.test(gl_id)) {
                return true;
            } else {
                return false;
            }
        } else if (gl_id.length === 8) {
            if (grid_location_pattern_AR09ax09.test(gl_id)) {
                return true;
            } else {
                return false;
            }
        } else {
            if (grid_location_pattern_AR09ax09AX.test(gl_id)) {
                return true;
            } else {
                return false;
            }
        }
    } else {
        // Invalid string length
        return false;
    }
}


// ====================================================================
// Find cooresponding grid ID for a given lat/lon location
// Input parameters: Longitude and Latitiude. (Use minus prefix for South and West)
// Returns: A 10 character Grid Locator ID string
function lat_lon_to_Grid_ID(lat, lon) {
	
	// Check that latitude and longitude values given are within required range
	if (!( -90 < lat < 90)) {
		console.log(`latitude must be -90<=lat<90, given ${lat}\n`);
		return false;
	}
	
	if (!( -180 < lon < 180)) {
		console.log(`longitude must be -180<=lon<180, given ${lon}\n`);
		return false;
	}
	
	// Convert plus/minus 90 deg lat and 180 deg lon format to 180 deg Lat and 360 deg Lon
	const gls_lon = lon + 180.0;
	const gls_lat = lat + 90.0;
	
	// Created initial empty grid ID string
	grid_ID = "";
	
	// -----------------------------------------
	// Calculate First Pair (AA-RR)
	// Field, A-R, 18x18, 20 x 10 degrees
	const field_lon_index = parseInt(gls_lon / 20);
	grid_ID += field[field_lon_index];
	
	const field_lat_index = parseInt(gls_lat / 10);
	grid_ID += field[field_lat_index];
	
	// -----------------------------------------
	// Calculate Second Pair (00-99)
	// Square, 0-9, 10x10,  2 x 1 degrees
	const lon_square_index_rmdr = (gls_lon - field_lon_index * 20) / 2;
	const grid_lon_square = parseInt(lon_square_index_rmdr).toString();
	grid_ID += grid_lon_square;
	
	const lat_square_index_rmdr = (gls_lat - field_lat_index * 10) / 1;
	const grid_lat_square = parseInt(lat_square_index_rmdr).toString();
	grid_ID += grid_lat_square;
	
	// -----------------------------------------
	// Calculate Third Pair (aa-xx)
	// Subsquare, a-x, 24x24,  5 x 2.5 minutes
	const lon_subsquare_rmdr = lon_square_index_rmdr * 2 - parseInt(lon_square_index_rmdr) * 2;
	const lon_subsquare_index = parseInt(lon_subsquare_rmdr * 12);
	const grid_lon_subsquare = subsquare[lon_subsquare_index];
	grid_ID += grid_lon_subsquare;
	
	const lat_subsquare_rmdr = lat_square_index_rmdr - parseInt(lat_square_index_rmdr);
	const lat_subsquare_index = parseInt(lat_subsquare_rmdr * 24);
	const grid_lat_subsquare = subsquare[lat_subsquare_index];
	grid_ID += grid_lat_subsquare;
	
	// -----------------------------------------
	// Calculate Fourth Pair PAIR (00-99)
	// Extended square, 0-9, 10x10, 30 x 15 seconds
	const lon_extsubsquare_rmdr = lon_subsquare_rmdr - (lon_subsquare_index / 12);
	const lon_extsubsquare_index_rmdr = lon_extsubsquare_rmdr * 120;
	grid_ID += parseInt(lon_extsubsquare_index_rmdr).toString();
	
	const lat_extsubsquare_rmdr = lat_subsquare_rmdr - (lat_subsquare_index / 24);
	const lat_extsubsquare_index_rmdr = lat_extsubsquare_rmdr * 240;
	grid_ID += parseInt(lat_extsubsquare_index_rmdr)
	
	// -----------------------------------------
    // Calculate Fifth Pair (AA-XX)
    // Super extended square, A-X, 24x24, 1.25 x 0.625 seconds
    const lon_supextsquare_rmdr = lon_extsubsquare_rmdr - parseInt(lon_extsubsquare_index_rmdr)/120;
    const lon_supextsquare_index = parseInt(lon_supextsquare_rmdr * 2880)
    grid_ID += supsextsubsquare[lon_supextsquare_index]
    
    const lat_supextsquare_rmdr = lat_extsubsquare_rmdr - parseInt(lat_extsubsquare_index_rmdr)/240;
    const lat_supextsquare_index = parseInt(lat_supextsquare_rmdr * 5760)
    grid_ID += supsextsubsquare[parseInt(lat_supextsquare_index)]

    return grid_ID
}


// ====================================================================
// Calculates and returns center and four corner coordinates of a given grid ID square
// Input parameter: 2, 4, 6, 8 or 10 character grid locator character string
// Returns: Structure containing lat/lon of the SW, NW, NE, SE corners and Center of the provide grid ID 
function grid_location_ID_bounds(gl_id) {
	
	var SW_coord_lon, SW_coord_lat;
	var NW_coord_lon, NW_coord_lat;
	var NE_coord_lon, NE_coord_lat;
	var SE_coord_lon, SE_coord_lat;
	var CEN_coord_lon, CEN_coord_lat;

    if (gl_id.length === 10) {
        // Calculate the longitude and latitude of the square's SW corner
        SW_coord_lon = lon_field[gl_id[0]] + lon_square[gl_id[2]] + lon_subsquare[gl_id[4]]/60 + lon_extendedsquare[gl_id[6]]/3600 + lon_supextsquare[gl_id[8]]/3600;
        SW_coord_lat = lat_field[gl_id[1]] + lat_square[gl_id[3]] + lat_subsquare[gl_id[5]]/60 + lat_extendedsquare[gl_id[7]]/3600 + lat_supextsquare[gl_id[9]]/3600;

        // Calculate lon/lat for the other three corners and center from the SW corner location
        NW_coord_lon = SW_coord_lon;
        NW_coord_lat = SW_coord_lat + 0.625/3600;

        NE_coord_lon = SW_coord_lon + 1.25/3600;
        NE_coord_lat = SW_coord_lat + 0.625/3600;

        SE_coord_lon = SW_coord_lon + 1.25/3600;
        SE_coord_lat = SW_coord_lat;

        CEN_coord_lon = SW_coord_lon + 0.625/3600;
        CEN_coord_lat = SW_coord_lat + 0.3125/3600;
    } else if (gl_id.length === 8) {
        // Calculate the longitude and latitude of the square's SW corner
        SW_coord_lon = lon_field[gl_id[0]] + lon_square[gl_id[2]] + lon_subsquare[gl_id[4]]/60 + lon_extendedsquare[gl_id[6]]/3600;
        SW_coord_lat = lat_field[gl_id[1]] + lat_square[gl_id[3]] + lat_subsquare[gl_id[5]]/60 + lat_extendedsquare[gl_id[7]]/3600;

        // Calculate lon/lat for the other three corners and center from the SW corner location
        NW_coord_lon = SW_coord_lon;
        NW_coord_lat = SW_coord_lat + 15/3600;

        NE_coord_lon = SW_coord_lon + 30/3600;
        NE_coord_lat = SW_coord_lat + 15/3600;

        SE_coord_lon = SW_coord_lon + 30/3600;
        SE_coord_lat = SW_coord_lat;

        CEN_coord_lon = SW_coord_lon + 15/3600;
        CEN_coord_lat = SW_coord_lat + 7.5/3600;

	} else if (gl_id.length === 6) {
		// Calculate the longitude and latitude of the square's SW corner
		SW_coord_lon = lon_field[gl_id[0]] + lon_square[gl_id[2]] + lon_subsquare[gl_id[4]]/60;
		SW_coord_lat = lat_field[gl_id[1]] + lat_square[gl_id[3]] + lat_subsquare[gl_id[5]]/60;
		
		// Calculate lon/lat for the other three corners and center from the SW corner location
		NW_coord_lon = SW_coord_lon;
		NW_coord_lat = SW_coord_lat + 2.5/60;
		
		NE_coord_lon = SW_coord_lon + 5/60;
		NE_coord_lat = SW_coord_lat + 2.5/60;
		
		SE_coord_lon = SW_coord_lon + 5/60;
		SE_coord_lat = SW_coord_lat;
		
		CEN_coord_lon = SW_coord_lon + 2.5/60;
		CEN_coord_lat = SW_coord_lat + 1.25/60;

	} else if (gl_id.length === 4) {
		// Calculate the longitude and latitude of the square's SW corner
		SW_coord_lon = lon_field[gl_id[0]] + lon_square[gl_id[2]];
		SW_coord_lat = lat_field[gl_id[1]] + lat_square[gl_id[3]];
	
		// Calculate lon/lat for the other three corners and center from the SW corner location
		NW_coord_lon = SW_coord_lon;
		NW_coord_lat = SW_coord_lat + 1;
	
		NE_coord_lon = SW_coord_lon + 2;
		NE_coord_lat = SW_coord_lat + 1;
	
		SE_coord_lon = SW_coord_lon + 2;
		SE_coord_lat = SW_coord_lat;
	
		CEN_coord_lon = SW_coord_lon + 1;
		CEN_coord_lat = SW_coord_lat + 0.5;

	} else if (gl_id.length === 2) {
		// Calculate the longitude and latitude of the square's SW corner
		SW_coord_lon = lon_field[gl_id[0]];
		SW_coord_lat = lat_field[gl_id[1]];
	
		// Calculate lon/lat for the other three corners and center from the SW corner location
		NW_coord_lon = SW_coord_lon;
		NW_coord_lat = SW_coord_lat + 10;
	
		NE_coord_lon = SW_coord_lon + 20;
		NE_coord_lat = SW_coord_lat + 10;
	
		SE_coord_lon = SW_coord_lon + 20;
		SE_coord_lat = SW_coord_lat;
	
		CEN_coord_lon = SW_coord_lon + 10;
		CEN_coord_lat = SW_coord_lat + 5;

	} else {
		return false;
	}
	
	grid_bounds = {
		NE: {lat: NE_coord_lat, lon: NE_coord_lon},
		SE: {lat: SE_coord_lat, lon: SE_coord_lon},
		SW: {lat: SW_coord_lat, lon: SW_coord_lon},
		NW: {lat: NW_coord_lat, lon: NW_coord_lon},
		CEN: {lat: CEN_coord_lat, lon: CEN_coord_lon}
	};
		
			return grid_bounds;
}


// ====================================================================
// Calculate the area and perimeter information for a given grid 
// Input parameter: 2, 4, 6, 8 or 10 character grid locator character string
// Returns: Structure containing grid area and perimeter in miles and kilometers
function grid_loc_size(gridID) {

	//Get corner coordinates of grid square
	var gridBounds = grid_location_ID_bounds(gridID);
	
	// -----------------------------------------
	var northSide = lat_lon_distance(gridBounds["NW"]["lat"],
									 gridBounds["NW"]["lon"],
									 gridBounds["NE"]["lat"],
									 gridBounds["NE"]["lon"]);

	var northSideMi = northSide["smi"];
	var northSideKm = northSide["km"];
	
	// -----------------------------------------
	var southSide = lat_lon_distance(gridBounds["SW"]["lat"],
									 gridBounds["SW"]["lon"],
									 gridBounds["SE"]["lat"],
									 gridBounds["SE"]["lon"]);

	var southSideMi = southSide["smi"];
	var southSideKm = southSide["km"];
	
	// -----------------------------------------
	var eastwestSides = lat_lon_distance(gridBounds["NE"]["lat"],
										 gridBounds["NE"]["lon"],
										 gridBounds["SE"]["lat"],
										 gridBounds["SE"]["lon"]);

	var eastwestSidesMi = eastwestSides["smi"];
	var eastwestSidesKm = eastwestSides["km"];
	
	// -----------------------------------------
	var areaSqMi = ((northSideMi + southSideMi) / 2) * eastwestSidesMi;
	var areaSqKm = ((northSideKm + southSideKm) / 2) * eastwestSidesKm;
	
	var perimMi = northSideMi + southSideMi + eastwestSidesMi * 2;
	var perimKm = northSideKm + southSideKm + eastwestSidesKm * 2;
	
	var size = {
				sqmi: areaSqMi,
				sqkm: areaSqKm,
				permi: perimMi,
				perkm: perimKm,
				ndistmi: northSideMi,
				ndistkm: northSideKm,
				sdistmi: southSideMi,
				sdistkm: southSideKm,
				ewdistmi: eastwestSidesMi,
				ewdistkm: eastwestSidesKm,
	};
	
	return size;
}


// ====================================================================
// Calculates the distance between two lat/lon coordinates
// Input parameters: lat/lon of a start point and end point
// Returns: Structure containing the distance between the two point in kilometers, statue miles and nautical miles
function lat_lon_distance(slat, slon, elat, elon) {

	// Check that latitude and longitude values given are within required range
	if (!(slat >= -90 && slat <= 90)) {
	  console.log(`latitude must be -90<=lat<90, given ${slat}\n`);
	  return false;
	}
  
	if (!(slon >= -180 && slon <= 180)) {
	  console.log(`longitude must be -180<=lon<180, given ${slon}\n`);
	  return false;
	}
  
	if (!(elat >= -90 && elat <= 90)) {
	  console.log(`latitude must be -90<=lat<90, given ${elat}\n`);
	  return false;
	}
  
	if (!(elon >= -180 && elon <= 180)) {
	  console.log(`longitude must be -180<=lon<180, given ${elon}\n`);
	  return false;
	}
  
	// Scale multipliers for different units of distance
	const kilometers = 6371.0210;
	const statute_miles = 3958.7613;
	const nautical_miles = 3437.8675;
  
	// Convert lats and lons to radians
	const r_start_lat = slat * Math.PI / 180;
	const r_start_lon = slon * Math.PI / 180;
  	const r_end_lat = elat * Math.PI / 180;
	const r_end_lon = elon * Math.PI / 180;
  
	// The formula, "acos(sin(slat)*sin(elat) + cos(slat)*cos(elat)*cos(slon - elon))"
	// provides the arc in Radians of the great circle path between two points on the Earth.
	const arc_in_radians = Math.acos(Math.sin(r_start_lat) * Math.sin(r_end_lat) + Math.cos(r_start_lat) * Math.cos(r_end_lat) * Math.cos(r_start_lon - r_end_lon));

	// Converter arc_in_radians to kilometers, statute miles and nautical miles
	const km = kilometers * arc_in_radians
    const smi = statute_miles * arc_in_radians
    const nmi = nautical_miles * arc_in_radians

	return { km: km, smi: smi, nmi: nmi };
}


// ====================================================================
// Calculates distance between center points of two grid ID values
// Input parameters: Grid ID of a start point and end point
// Returns: Structure containing the distance between the two point in kilometer, statue miles and nautical miles
function grid_location_distance(gl_id1, gl_id2) {
	
	// Get conter lat/lon coordinate for gl_id1
    const coords_1 = grid_location_ID_bounds(gl_id1);
    const cen_lat_coord_1 = coords_1['CEN']['lat'];
    const cen_lon_coord_1 = coords_1['CEN']['lon'];

    // Get conter lat/lon coordinate for gl_id2
    const coords_2 = grid_location_ID_bounds(gl_id2);
    const cen_lat_coord_2 = coords_2['CEN']['lat'];
    const cen_lon_coord_2 = coords_2['CEN']['lon'];

    return lat_lon_distance(cen_lat_coord_1, cen_lon_coord_1, cen_lat_coord_2, cen_lon_coord_2);
}


// ====================================================================
// Calculate bearing from start location to end location using lat/lon values
// Input parameters: Lat/Lon of a start point and end point
// Returns: Integer value between 0 and 360 degrees of initial bearing angle at start point
function angle_from_coordinates(slat, slon, elat, elon) {
    if (slat < -90 || slat > 90) {
        console.log('latitude must be -90<=lat<90, given', slat);
        return false;
    }

    if (slon < -180 || slon > 180) {
        console.log('longitude must be -180<=lon<180, given', slon);
        return false;
    }

    if (elat < -90 || elat > 90) {
        console.log('latitude must be -90<=lat<90, given', elat);
        return false;
    }

    if (elon < -180 || elon > 180) {
        console.log('longitude must be -180<=lon<180, given', elon);
        return false;
    }

    // Convert Lat/lon values from degrees to radians
    const slat_r = slat * Math.PI / 180;
    const slon_r = slon * Math.PI / 180;
    const elat_r = elat * Math.PI / 180;
    const elon_r = elon * Math.PI / 180;

    // Calculate bearing with result in radians
    const dlon_r = elon_r - slon_r;
    const X = Math.sin(dlon_r) * Math.cos(elat_r);
    const Y = Math.cos(slat_r) * Math.sin(elat_r) - Math.sin(slat_r) * Math.cos(elat_r) * Math.cos(dlon_r);
    let bearingRad = Math.atan2(X, Y);

    // Convert bearing into degrees and convert from 180/-180 degree format to 360 format 
    let start_bearing_deg = (Math.round((bearingRad * 180 / Math.PI + 360) % 360));
    return start_bearing_deg;
}


// ====================================================================
// Calculate bearing from start location to end location using either grid ID values
// Input parameters: Grid IDs for the start point and end point 
// Returns: Float value between 0 and 360 degrees of initial bearing angle at start point
function angle_from_grid_location_IDs(gl_id1, gl_id2) {
    
    // Get gl_id1 lat/lon center
    var coords_1 = grid_location_ID_bounds(gl_id1);
    var cen_lat_coord_1 = coords_1['CEN']['lat'];
    var cen_lon_coord_1 = coords_1['CEN']['lon'];
    
    // Get gl_id2 lat/lon center
    var coords_2 = grid_location_ID_bounds(gl_id2);
    var cen_lat_coord_2 = coords_2['CEN']['lat'];
    var cen_lon_coord_2 = coords_2['CEN']['lon'];
    
    // Get distance between centers of gl_id1 and gl_id2 
    return angle_from_coordinates(cen_lat_coord_1, cen_lon_coord_1, cen_lat_coord_2, cen_lon_coord_2);
}