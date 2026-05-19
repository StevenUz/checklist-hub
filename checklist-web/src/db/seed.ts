import { randomUUID } from "node:crypto";

import { hash } from "argon2";
import { eq } from "drizzle-orm";

import { db } from ".";
import {
  activities,
  categories,
  checklistTemplates,
  templateItems,
  templateSections,
  users,
} from "./schema";

const SCUBA_CHECKLIST = [
  {
    title: "Personal Readiness",
    items: [
      "Verify diving certification card is valid and available",
      "Confirm diving insurance (if required)",
      "Assess personal health and fitness condition",
      "Stay hydrated before diving",
      "Avoid alcohol before the dive",
      "Get adequate sleep before the dive",
      "Review dive plan and emergency procedures",
      "Check weather and sea conditions",
      "Confirm dive site location and access",
      "Inform someone about your dive schedule",
    ],
  },
  {
    title: "Dive Gear Preparation",
    items: [
      "Inspect wetsuit / drysuit condition",
      "Check mask and snorkel",
      "Test fins and straps",
      "Inspect BCD (Buoyancy Control Device)",
      "Check regulator functionality",
      "Verify alternate air source",
      "Test pressure gauges/computer",
      "Inspect air tank condition and pressure",
      "Verify tank valve operation",
      "Check weight system and quick-release mechanism",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Pack dive computer",
      "Bring surface marker buoy (SMB)",
      "Carry dive knife or cutting tool",
      "Bring underwater flashlight if needed",
      "Pack whistle or signaling device",
      "Prepare first aid kit",
      "Confirm emergency oxygen availability",
      "Carry waterproof communication device if applicable",
    ],
  },
  {
    title: "Before Entering Water",
    items: [
      "Assemble full equipment setup",
      "Perform buddy equipment check",
      "Confirm air supply levels",
      "Secure all straps and hoses",
      "Activate dive computer",
      "Review hand signals with buddy",
      "Confirm maximum depth and bottom time",
      "Verify entry and exit procedures",
      "Check current and visibility conditions",
      "Confirm emergency meeting point",
    ],
  },
  {
    title: "During the Dive",
    items: [
      "Monitor air consumption regularly",
      "Maintain buddy contact",
      "Monitor depth and no-decompression limits",
      "Maintain neutral buoyancy",
      "Avoid rapid ascents",
      "Watch for environmental hazards",
      "Follow planned route and time limits",
      "Perform safety stop before surfacing",
    ],
  },
  {
    title: "After the Dive",
    items: [
      "Log dive details",
      "Rinse and clean equipment",
      "Inspect equipment for damage",
      "Store gear properly",
      "Rehydrate and rest",
      "Monitor for signs of decompression sickness",
      "Recharge dive computer/flashlights if needed",
      "Review dive performance and issues",
      "Upload dive photos/videos if applicable",
      "Plan surface interval before next dive",
    ],
  },
] as const;

const DRONE_PREFLIGHT_CHECKLIST = [
  {
    title: "Personal Readiness",
    items: [
      "Verify drone operator certification/license requirements",
      "Carry required identification and permits",
      "Review local drone regulations and airspace restrictions",
      "Check weather conditions (wind, rain, visibility)",
      "Assess physical and mental condition before flight",
      "Ensure adequate battery level for mobile device/controller",
      "Inform team or observer about flight plan",
      "Review emergency procedures",
      "Confirm mission objectives and flight area",
      "Check NOTAMs or temporary flight restrictions",
    ],
  },
  {
    title: "Drone Inspection",
    items: [
      "Inspect drone body for visible damage",
      "Verify propellers are properly attached and undamaged",
      "Check motors for debris or obstruction",
      "Inspect landing gear condition",
      "Confirm gimbal functionality",
      "Clean camera lens and sensors",
      "Verify firmware is updated",
      "Check internal storage or SD card availability",
      "Ensure GPS module is functioning",
      "Confirm remote controller operation",
    ],
  },
  {
    title: "Battery and Power Checks",
    items: [
      "Fully charge drone batteries",
      "Fully charge controller batteries",
      "Bring spare batteries if needed",
      "Inspect batteries for swelling or damage",
      "Confirm battery locking mechanism is secure",
      "Check battery temperature before flight",
      "Pack charging equipment if necessary",
    ],
  },
  {
    title: "Flight Environment Assessment",
    items: [
      "Inspect takeoff and landing zone",
      "Check for obstacles (trees, power lines, buildings)",
      "Assess nearby people, vehicles, or animals",
      "Verify GPS signal strength",
      "Evaluate electromagnetic interference risks",
      "Confirm safe emergency landing areas",
      "Check sun position and lighting conditions",
      "Assess wind direction and gusts",
    ],
  },
  {
    title: "Flight Setup",
    items: [
      "Power on controller and drone",
      "Verify controller-drone connection",
      "Calibrate compass if required",
      "Confirm home point is correctly set",
      "Check satellite connection count",
      "Verify return-to-home settings",
      "Configure camera settings",
      "Confirm flight mode selection",
      "Set maximum altitude and distance limits",
      "Test basic control responsiveness",
    ],
  },
  {
    title: "Before Takeoff",
    items: [
      "Conduct final visual inspection",
      "Confirm propeller area is clear",
      "Verify recording settings if filming",
      "Start video recording if needed",
      "Announce takeoff to nearby personnel",
      "Confirm battery levels are sufficient",
      "Double-check mission route",
      "Ensure failsafe settings are active",
      "Verify obstacle avoidance systems",
      "Begin takeoff slowly and steadily",
    ],
  },
  {
    title: "During Flight",
    items: [
      "Maintain visual line of sight",
      "Monitor battery levels continuously",
      "Watch for airspace hazards",
      "Monitor GPS signal and telemetry",
      "Avoid restricted or crowded areas",
      "Maintain safe altitude",
      "Monitor weather changes",
      "Avoid aggressive maneuvers when unnecessary",
      "Keep communication with spotter/team",
      "Be prepared for manual return if needed",
    ],
  },
  {
    title: "After Flight",
    items: [
      "Land safely in designated area",
      "Power off drone and controller",
      "Inspect drone for damage",
      "Remove and store batteries safely",
      "Review captured footage/photos",
      "Log flight details",
      "Check remaining battery levels",
      "Clean drone and equipment if necessary",
      "Recharge batteries for next mission",
      "Report incidents or anomalies if applicable",
    ],
  },
] as const;

const INTERNATIONAL_TRAVEL_CHECKLIST = [
  {
    title: "Travel Documents",
    items: [
      "Verify passport validity (minimum 6 months recommended)",
      "Check visa requirements for destination countries",
      "Print or save digital copies of passport and visas",
      "Prepare travel insurance documents",
      "Carry flight tickets and boarding passes",
      "Confirm hotel/accommodation reservations",
      "Prepare emergency contact information",
      "Carry driver's license or international driving permit if needed",
      "Check vaccination or health certificate requirements",
      "Store important documents in secure travel wallet",
    ],
  },
  {
    title: "Financial Preparation",
    items: [
      "Notify bank about international travel",
      "Verify credit/debit cards work abroad",
      "Exchange currency or prepare local cash",
      "Check international transaction fees",
      "Set travel budget",
      "Enable online banking access",
      "Prepare backup payment method",
      "Save emergency financial contacts",
    ],
  },
  {
    title: "Health and Safety",
    items: [
      "Pack personal medications",
      "Carry prescriptions if required",
      "Prepare first aid kit",
      "Check destination health advisories",
      "Verify vaccination requirements",
      "Pack hygiene and sanitary products",
      "Save emergency medical contacts",
      "Research local emergency numbers",
      "Check weather forecast for destination",
      "Prepare sunscreen/insect repellent if necessary",
    ],
  },
  {
    title: "Packing Preparation",
    items: [
      "Create packing list based on destination climate",
      "Pack weather-appropriate clothing",
      "Pack comfortable walking shoes",
      "Prepare travel-size toiletries",
      "Pack chargers and adapters",
      "Bring universal power adapter",
      "Carry portable power bank",
      "Pack headphones/entertainment items",
      "Prepare reusable water bottle",
      "Label luggage with contact information",
    ],
  },
  {
    title: "Technology and Communication",
    items: [
      "Verify international roaming plan",
      "Download offline maps",
      "Save digital copies of reservations",
      "Install translation apps if needed",
      "Charge all devices before departure",
      "Backup important phone data",
      "Prepare SIM card/eSIM if necessary",
      "Download airline and travel apps",
      "Check internet availability at destination",
    ],
  },
  {
    title: "Home Preparation Before Departure",
    items: [
      "Lock all windows and doors",
      "Unplug unnecessary electronics",
      "Arrange mail/package collection",
      "Inform trusted person about travel plans",
      "Set automatic lights or timers if needed",
      "Empty refrigerator of perishable food",
      "Take out trash",
      "Secure valuables at home",
      "Confirm pet care arrangements",
      "Adjust thermostat if needed",
    ],
  },
  {
    title: "Airport and Departure Preparation",
    items: [
      "Confirm flight time and terminal",
      "Check airline baggage requirements",
      "Arrive early at airport",
      "Verify carry-on restrictions",
      "Charge devices before departure",
      "Keep essential items in carry-on luggage",
      "Prepare snacks and water bottle",
      "Wear comfortable travel clothing",
      "Check transportation to airport",
      "Verify passport and tickets before leaving home",
    ],
  },
  {
    title: "During Travel",
    items: [
      "Monitor flight updates",
      "Keep valuables secure",
      "Stay hydrated during travel",
      "Follow customs and immigration instructions",
      "Keep important documents accessible",
      "Confirm transportation from airport to accommodation",
      "Inform family/friends after arrival",
      "Check local transportation options",
      "Follow local laws and regulations",
      "Stay aware of surroundings and safety guidelines",
    ],
  },
] as const;

const CAMPING_HIKING_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose camping and hiking destination",
      "Check weather forecast",
      "Review trail maps and route information",
      "Verify campsite reservations or permits",
      "Inform someone about travel plans and schedule",
      "Research local wildlife and safety guidelines",
      "Check fire regulations and restrictions",
      "Plan transportation and parking",
      "Estimate hiking duration and difficulty",
      "Prepare emergency contact information",
    ],
  },
  {
    title: "Shelter and Sleeping Gear",
    items: [
      "Pack tent and rainfly",
      "Bring tent stakes and repair kit",
      "Pack sleeping bag suitable for temperature",
      "Bring sleeping pad or air mattress",
      "Pack camping pillow",
      "Bring ground tarp or footprint",
      "Pack extra blankets if needed",
      "Test tent setup before departure",
    ],
  },
  {
    title: "Clothing and Personal Items",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket",
      "Pack hiking boots or trail shoes",
      "Bring extra socks",
      "Pack hat and sunglasses",
      "Bring gloves if needed",
      "Pack sleepwear",
      "Bring toiletries and hygiene products",
      "Pack towel and wet wipes",
      "Bring sunscreen and insect repellent",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Pack sufficient drinking water",
      "Bring water filtration or purification system",
      "Prepare meals and snacks",
      "Pack portable stove or cooking equipment",
      "Bring fuel for stove",
      "Pack cooking utensils and cookware",
      "Bring reusable plates/cups",
      "Pack cooler if necessary",
      "Store food in wildlife-safe containers",
      "Bring trash bags for waste disposal",
    ],
  },
  {
    title: "Hiking Equipment",
    items: [
      "Pack backpack with proper fit",
      "Bring hiking poles if needed",
      "Carry map and compass",
      "Bring GPS device or offline maps",
      "Pack flashlight or headlamp",
      "Bring extra batteries or power bank",
      "Carry whistle for emergencies",
      "Pack multitool or knife",
      "Bring lightweight rain cover for backpack",
      "Carry emergency shelter or blanket",
    ],
  },
  {
    title: "Safety and Emergency Supplies",
    items: [
      "Pack first aid kit",
      "Bring emergency medication",
      "Carry fire starter or waterproof matches",
      "Pack emergency whistle",
      "Bring signaling mirror if needed",
      "Carry rope or paracord",
      "Prepare emergency contact list",
      "Pack backup light source",
      "Bring bear spray if required in area",
      "Check phone battery before departure",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all packed gear",
      "Charge electronic devices",
      "Fill vehicle fuel tank",
      "Download offline maps",
      "Secure campsite reservation details",
      "Confirm weather and trail conditions",
      "Lock home and secure valuables",
      "Check vehicle emergency kit",
      "Verify all permits are packed",
      "Leave itinerary with trusted contact",
    ],
  },
  {
    title: "At the Campsite",
    items: [
      "Inspect campsite safety",
      "Set up tent on stable ground",
      "Store food securely",
      "Identify nearest water source",
      "Establish safe campfire area",
      "Keep campsite clean and organized",
      "Follow Leave No Trace principles",
      "Monitor weather conditions",
      "Secure gear overnight",
      "Extinguish fire completely before sleeping",
    ],
  },
  {
    title: "During the Hike",
    items: [
      "Stay on marked trails",
      "Monitor hydration levels",
      "Take regular breaks",
      "Watch for wildlife and hazards",
      "Check navigation frequently",
      "Monitor weather changes",
      "Keep group together",
      "Avoid overexertion",
      "Follow trail safety guidelines",
      "Turn back if conditions become unsafe",
    ],
  },
  {
    title: "Before Leaving",
    items: [
      "Pack all gear and belongings",
      "Clean campsite thoroughly",
      "Extinguish campfire completely",
      "Dispose of trash properly",
      "Check campsite for forgotten items",
      "Inspect area for environmental impact",
      "Secure equipment for transport",
      "Review trip notes or observations",
      "Notify contacts after safe return",
      "Clean and dry gear after arriving home",
    ],
  },
] as const;

const TENT_CAMPING_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose camping destination",
      "Decide trip dates and duration",
      "Check campsite availability and reservations",
      "Review campsite rules and regulations",
      "Check weather forecast",
      "Research terrain and local conditions",
      "Plan transportation and route",
      "Share itinerary with friends/family",
      "Prepare emergency contact information",
      "Verify required permits or passes",
    ],
  },
  {
    title: "Tent and Shelter Equipment",
    items: [
      "Pack tent",
      "Pack rainfly and ground tarp",
      "Bring tent stakes and guylines",
      "Carry tent repair kit",
      "Test tent setup before departure",
      "Pack sleeping bags",
      "Bring sleeping pads or air mattresses",
      "Pack camping pillows",
      "Bring extra blankets if needed",
      "Prepare waterproof storage bags",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket",
      "Pack extra socks and underwear",
      "Bring hiking/camping shoes",
      "Pack warm layers for night temperatures",
      "Bring hat and sunglasses",
      "Pack gloves if needed",
      "Carry personal hygiene products",
      "Bring towel and wet wipes",
      "Pack sunscreen and insect repellent",
    ],
  },
  {
    title: "Food and Cooking Supplies",
    items: [
      "Plan meals for the trip",
      "Pack snacks and drinks",
      "Bring drinking water",
      "Carry water filtration or purification system",
      "Pack camping stove or grill",
      "Bring cooking fuel",
      "Carry cookware and utensils",
      "Bring reusable plates/cups",
      "Pack cooler if necessary",
      "Bring trash bags for waste disposal",
    ],
  },
  {
    title: "Safety and Emergency Equipment",
    items: [
      "Pack first aid kit",
      "Bring flashlight or headlamp",
      "Carry extra batteries or power bank",
      "Pack fire starter or matches",
      "Bring multitool or knife",
      "Carry emergency whistle",
      "Bring map and compass",
      "Pack phone charger/power bank",
      "Prepare emergency shelter or blanket",
      "Carry any personal medications",
    ],
  },
  {
    title: "Camp Setup Preparation",
    items: [
      "Select safe tent location",
      "Check ground stability and drainage",
      "Clear rocks and debris from tent area",
      "Set up tent securely",
      "Store food safely away from wildlife",
      "Designate cooking and eating area",
      "Prepare campfire area if allowed",
      "Organize camping gear accessibly",
      "Keep emergency supplies reachable",
      "Check nearby restroom/water access",
    ],
  },
  {
    title: "Activities and Recreation",
    items: [
      "Pack hiking equipment if needed",
      "Bring fishing gear if allowed",
      "Carry outdoor games or activities",
      "Pack camera or binoculars",
      "Bring books or entertainment items",
      "Prepare swimming gear if applicable",
      "Pack folding chairs or picnic blanket",
      "Bring portable speaker if appropriate",
      "Plan group activities",
      "Prepare backup activities for bad weather",
    ],
  },
  {
    title: "Before Leaving Home",
    items: [
      "Charge all electronic devices",
      "Download offline maps",
      "Fuel vehicle",
      "Secure home before departure",
      "Inform emergency contact of destination",
      "Double-check all packed items",
      "Verify reservation confirmations",
      "Check traffic and travel conditions",
      "Prepare cash/cards for emergencies",
      "Pack IDs and important documents",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor weather conditions",
      "Stay hydrated",
      "Keep campsite clean",
      "Follow fire safety rules",
      "Respect wildlife and nature",
      "Follow Leave No Trace principles",
      "Secure valuables and food overnight",
      "Keep communication devices charged",
      "Supervise children and pets",
      "Stay aware of surroundings",
    ],
  },
  {
    title: "Before Returning Home",
    items: [
      "Extinguish campfire completely",
      "Clean campsite thoroughly",
      "Pack all equipment and trash",
      "Check campsite for forgotten items",
      "Secure gear for transport",
      "Dispose of waste properly",
      "Inspect tent and gear for damage",
      "Notify contacts after safe return",
      "Clean and dry equipment at home",
      "Store camping gear properly",
    ],
  },
] as const;

const ROAD_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose destination and route",
      "Plan daily driving distances",
      "Research road conditions and traffic",
      "Check weather forecast along the route",
      "Book accommodations if needed",
      "Identify fuel stations and rest stops",
      "Prepare backup route options",
      "Share itinerary with family or friends",
      "Save emergency contact numbers",
      "Download offline maps/navigation",
    ],
  },
  {
    title: "Vehicle Inspection",
    items: [
      "Check engine oil level",
      "Inspect coolant level",
      "Check brake fluid",
      "Verify windshield washer fluid",
      "Inspect tire pressure",
      "Check spare tire condition",
      "Test brakes",
      "Inspect headlights and taillights",
      "Verify battery condition",
      "Ensure windshield wipers work properly",
    ],
  },
  {
    title: "Emergency and Safety Supplies",
    items: [
      "Pack first aid kit",
      "Bring emergency roadside kit",
      "Carry jumper cables",
      "Pack flashlight with extra batteries",
      "Bring reflective warning triangle",
      "Carry portable phone charger/power bank",
      "Pack basic tools and multitool",
      "Bring tire inflator or repair kit",
      "Carry emergency blanket",
      "Prepare extra drinking water",
    ],
  },
  {
    title: "Documents and Finances",
    items: [
      "Carry driver's license",
      "Bring vehicle registration documents",
      "Carry proof of insurance",
      "Pack roadside assistance information",
      "Prepare toll payment methods",
      "Bring cash and bank cards",
      "Verify fuel payment options",
      "Store copies of important documents",
    ],
  },
  {
    title: "Packing and Luggage",
    items: [
      "Pack weather-appropriate clothing",
      "Bring comfortable shoes",
      "Pack toiletries and hygiene items",
      "Prepare snacks and drinks",
      "Bring reusable water bottles",
      "Pack chargers and electronics",
      "Organize luggage efficiently",
      "Secure loose items inside vehicle",
      "Bring travel pillows and blankets",
      "Pack entertainment items for passengers",
    ],
  },
  {
    title: "Navigation and Technology",
    items: [
      "Update GPS/navigation apps",
      "Download offline maps",
      "Prepare phone mounts and chargers",
      "Test car audio and Bluetooth",
      "Save hotel and destination addresses",
      "Check mobile network coverage",
      "Bring camera or travel accessories",
      "Charge all electronic devices before departure",
    ],
  },
  {
    title: "Comfort and Convenience",
    items: [
      "Clean vehicle interior",
      "Adjust seats and mirrors",
      "Prepare sunglasses",
      "Pack sunscreen if needed",
      "Bring reusable shopping bags",
      "Prepare wet wipes and tissues",
      "Bring hand sanitizer",
      "Organize easy access to snacks and essentials",
      "Prepare playlists or podcasts",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Fill fuel tank",
      "Recheck weather conditions",
      "Confirm accommodations and reservations",
      "Inform someone of departure time",
      "Lock home and secure valuables",
      "Unplug unnecessary electronics at home",
      "Check traffic conditions",
      "Verify all luggage is packed",
      "Double-check travel documents",
      "Ensure everyone is ready before departure",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Take regular driving breaks",
      "Stay hydrated",
      "Monitor fuel levels",
      "Follow speed limits and traffic laws",
      "Watch for weather changes",
      "Keep phone charged",
      "Rotate drivers if possible",
      "Secure valuables when stopping",
      "Monitor vehicle performance",
      "Stay alert and avoid distracted driving",
    ],
  },
  {
    title: "After Arrival",
    items: [
      "Inspect vehicle for issues",
      "Secure luggage and valuables",
      "Confirm accommodation check-in",
      "Recharge devices if needed",
      "Review next-day travel plans",
      "Refuel vehicle if necessary",
      "Back up travel photos/videos",
      "Notify family/friends of safe arrival",
      "Organize items for easy access",
      "Rest before continuing the trip",
    ],
  },
] as const;

const PHOTO_SHOOT_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Define the purpose and style of the photo shoot",
      "Confirm date, time, and location",
      "Check weather forecast for outdoor shoots",
      "Create a shot list or mood board",
      "Confirm schedule with clients/models/team",
      "Obtain location permits if required",
      "Scout the location in advance",
      "Plan backup indoor location if necessary",
      "Prepare posing ideas and references",
      "Review lighting conditions at the location",
    ],
  },
  {
    title: "Camera Equipment",
    items: [
      "Pack camera body/bodies",
      "Charge camera batteries",
      "Bring spare batteries",
      "Pack memory cards",
      "Format memory cards if needed",
      "Clean camera sensor and lenses",
      "Pack required lenses",
      "Bring lens filters if necessary",
      "Carry camera straps and mounts",
      "Test camera settings before departure",
    ],
  },
  {
    title: "Lighting Equipment",
    items: [
      "Pack flashes or strobes",
      "Bring light stands",
      "Pack softboxes or modifiers",
      "Carry reflectors",
      "Bring diffusers",
      "Pack triggers and sync cables",
      "Test lighting equipment",
      "Bring extension cords and power strips",
      "Pack spare bulbs/batteries if needed",
      "Prepare portable lighting for outdoor use",
    ],
  },
  {
    title: "Audio and Video Accessories (if applicable)",
    items: [
      "Pack microphones",
      "Bring audio recorder",
      "Carry headphones for monitoring",
      "Pack tripod or stabilizer",
      "Bring extra cables and adapters",
      "Test audio/video equipment",
    ],
  },
  {
    title: "Props and Styling",
    items: [
      "Prepare props for the shoot",
      "Confirm wardrobe and outfits",
      "Bring backup clothing options",
      "Pack accessories and jewelry",
      "Prepare makeup and hair supplies",
      "Bring lint roller and clothing clips",
      "Pack mirrors if needed",
      "Organize styling area",
    ],
  },
  {
    title: "Client and Team Coordination",
    items: [
      "Confirm arrival times with team members",
      "Share location details and parking instructions",
      "Prepare model release forms if needed",
      "Confirm contact numbers for all participants",
      "Review shoot schedule with the team",
      "Clarify responsibilities during the shoot",
      "Prepare snacks and water for the team",
      "Plan breaks during long sessions",
    ],
  },
  {
    title: "Technology and File Management",
    items: [
      "Charge laptop/tablet if bringing one",
      "Prepare backup storage devices",
      "Bring card readers and cables",
      "Verify editing software availability",
      "Prepare tethering setup if required",
      "Back up previous work before leaving",
      "Check internet/mobile hotspot availability if needed",
    ],
  },
  {
    title: "Before Leaving for the Shoot",
    items: [
      "Double-check all packed equipment",
      "Confirm batteries are fully charged",
      "Verify memory cards are empty and working",
      "Review shot list one final time",
      "Check traffic and travel time",
      "Confirm weather conditions again",
      "Bring cash/cards for emergencies",
      "Pack personal essentials and ID",
      "Secure equipment in transport cases",
      "Leave early to avoid delays",
    ],
  },
  {
    title: "During the Photo Shoot",
    items: [
      "Test exposure and lighting setup",
      "Review photos periodically for quality",
      "Communicate clearly with subjects/models",
      "Adjust settings as conditions change",
      "Keep equipment organized and protected",
      "Monitor battery and storage levels",
      "Follow the planned shot list",
      "Capture backup shots and variations",
      "Maintain safe working environment",
      "Back up files if possible during breaks",
    ],
  },
  {
    title: "After the Shoot",
    items: [
      "Back up all photos immediately",
      "Organize and label files",
      "Inspect equipment for damage",
      "Recharge batteries",
      "Clean and store equipment properly",
      "Review and select best images",
      "Send previews if agreed with client",
      "Archive project files securely",
      "Record notes for future improvements",
      "Confirm delivery timeline with client",
    ],
  },
] as const;

const VIDEO_PRODUCTION_CHECKLIST = [
  {
    title: "Pre-Production Planning",
    items: [
      "Define shooting goals and deliverables",
      "Finalize script or shooting outline",
      "Review storyboard or shot list",
      "Confirm filming schedule and call times",
      "Verify filming locations and permits",
      "Check weather forecast for outdoor shoots",
      "Confirm transportation and parking arrangements",
      "Prepare production timeline",
      "Share contact list with crew and talent",
      "Review safety requirements for the set",
    ],
  },
  {
    title: "Camera Equipment",
    items: [
      "Pack primary camera body",
      "Pack backup camera if available",
      "Charge camera batteries",
      "Bring spare batteries",
      "Pack memory cards/media storage",
      "Format memory cards if needed",
      "Clean lenses and camera sensors",
      "Pack required lenses",
      "Bring tripods, monopods, or stabilizers",
      "Test all camera settings before departure",
    ],
  },
  {
    title: "Audio Equipment",
    items: [
      "Pack microphones (lavaliers, shotgun, handheld)",
      "Bring audio recorder",
      "Pack headphones for monitoring",
      "Carry audio cables and adapters",
      "Test audio recording levels",
      "Bring spare batteries for audio gear",
      "Pack wind protection for microphones",
      "Prepare backup audio solution",
    ],
  },
  {
    title: "Lighting Equipment",
    items: [
      "Pack lights and light stands",
      "Bring softboxes or modifiers",
      "Pack reflectors and diffusers",
      "Carry extension cords and power strips",
      "Bring gaffer tape and clamps",
      "Test lighting equipment",
      "Pack spare bulbs or batteries",
      "Prepare portable lighting if filming outdoors",
    ],
  },
  {
    title: "Props, Wardrobe, and Set Preparation",
    items: [
      "Confirm wardrobe for all talent",
      "Pack backup clothing options",
      "Prepare props and set decorations",
      "Bring makeup and grooming supplies",
      "Pack mirrors and styling accessories",
      "Organize continuity notes and references",
      "Prepare branding materials if needed",
      "Check set cleanliness and readiness",
    ],
  },
  {
    title: "Crew and Talent Coordination",
    items: [
      "Confirm attendance of crew and talent",
      "Share filming schedule and shot list",
      "Assign crew responsibilities",
      "Prepare release forms if required",
      "Confirm catering/snacks/water arrangements",
      "Review communication methods during filming",
      "Plan breaks for long shooting sessions",
      "Confirm emergency contacts",
    ],
  },
  {
    title: "Technology and File Management",
    items: [
      "Bring laptop/tablet if needed",
      "Pack external hard drives or SSDs",
      "Bring card readers and cables",
      "Prepare backup storage solution",
      "Verify editing/project files availability",
      "Test tethering or live monitoring setup",
      "Charge all electronic devices",
      "Check internet/mobile hotspot access if needed",
    ],
  },
  {
    title: "Before Leaving for the Shoot",
    items: [
      "Double-check all packed equipment",
      "Verify batteries are fully charged",
      "Confirm memory/storage availability",
      "Review shot list one final time",
      "Check traffic and travel conditions",
      "Confirm location access instructions",
      "Bring IDs, permits, and documents",
      "Secure equipment in transport cases",
      "Leave early to avoid delays",
      "Notify crew of departure if necessary",
    ],
  },
  {
    title: "During Filming",
    items: [
      "Test video and audio before recording",
      "Monitor exposure, focus, and framing",
      "Check audio quality continuously",
      "Follow the shot list and production schedule",
      "Capture backup takes when needed",
      "Monitor battery and storage levels",
      "Keep equipment organized and protected",
      "Maintain clear communication with crew",
      "Ensure set safety at all times",
      "Back up footage during breaks if possible",
    ],
  },
  {
    title: "After Filming",
    items: [
      "Back up all footage immediately",
      "Organize and label media files",
      "Inspect equipment for damage",
      "Recharge batteries",
      "Clean and store equipment properly",
      "Review footage for missing shots",
      "Confirm wrap-up with crew and talent",
      "Archive project assets securely",
      "Record production notes for editing",
      "Plan next production or editing steps",
    ],
  },
] as const;

const WEDDING_EVENT_CHECKLIST = [
  {
    title: "Event Planning",
    items: [
      "Confirm wedding date and schedule",
      "Finalize guest list",
      "Send invitations and track RSVPs",
      "Confirm wedding venue booking",
      "Review ceremony and reception timeline",
      "Prepare seating arrangements",
      "Confirm wedding theme and decorations",
      "Plan transportation for couple and guests",
      "Prepare backup plan for bad weather",
      "Assign responsibilities to wedding coordinator/team",
    ],
  },
  {
    title: "Legal and Documentation",
    items: [
      "Verify marriage license requirements",
      "Prepare identification documents",
      "Confirm legal ceremony paperwork",
      "Schedule appointments if required",
      "Prepare copies of important documents",
      "Confirm officiant availability",
      "Review contracts with vendors",
      "Organize payment schedules and receipts",
    ],
  },
  {
    title: "Venue Preparation",
    items: [
      "Confirm venue setup details",
      "Verify ceremony and reception layouts",
      "Inspect lighting and sound systems",
      "Arrange tables, chairs, and decorations",
      "Confirm restroom availability and cleanliness",
      "Prepare signage and guest directions",
      "Coordinate parking arrangements",
      "Confirm power access for vendors and equipment",
      "Review emergency exits and safety procedures",
      "Verify venue access times",
    ],
  },
  {
    title: "Catering and Food",
    items: [
      "Finalize menu selections",
      "Confirm guest dietary requirements",
      "Schedule catering delivery/setup times",
      "Arrange wedding cake delivery",
      "Confirm beverages and bar setup",
      "Prepare serving schedule",
      "Verify tableware and utensils",
      "Arrange snacks/water for bridal party",
      "Confirm cleanup responsibilities",
    ],
  },
  {
    title: "Photography and Video",
    items: [
      "Confirm photographer schedule",
      "Confirm videographer schedule",
      "Review shot list and important moments",
      "Prepare backup memory cards and batteries",
      "Share venue access details with media team",
      "Confirm drone permissions if needed",
      "Prepare family/group photo list",
      "Designate contact person for photographer coordination",
    ],
  },
  {
    title: "Wedding Attire and Styling",
    items: [
      "Confirm wedding dress/suit fittings",
      "Prepare accessories and jewelry",
      "Pack comfortable backup shoes",
      "Schedule hair and makeup appointments",
      "Prepare emergency sewing/styling kit",
      "Steam or iron outfits if needed",
      "Organize outfits for bridal party",
      "Prepare rings and ring box",
      "Confirm bouquet and floral arrangements",
    ],
  },
  {
    title: "Music and Entertainment",
    items: [
      "Confirm DJ/band schedule",
      "Prepare ceremony and reception playlists",
      "Test microphones and speakers",
      "Confirm special songs and announcements",
      "Arrange dance floor setup",
      "Prepare backup audio equipment if needed",
      "Coordinate entertainment schedule",
      "Confirm timing for speeches and toasts",
    ],
  },
  {
    title: "Guest Experience",
    items: [
      "Prepare welcome table and guest book",
      "Arrange guest favors or gifts",
      "Confirm accommodation details for guests",
      "Organize transportation/shuttle services",
      "Prepare signage and seating charts",
      "Confirm accessibility needs for guests",
      "Arrange childcare if applicable",
      "Prepare emergency contact list",
    ],
  },
  {
    title: "Emergency and Backup Preparation",
    items: [
      "Prepare first aid kit",
      "Pack stain remover and tissues",
      "Bring extra phone chargers/power banks",
      "Prepare umbrellas or weather protection",
      "Carry backup copies of schedule and contacts",
      "Pack water and snacks for bridal party",
      "Confirm backup transportation options",
      "Assign person to handle emergencies",
    ],
  },
  {
    title: "Before the Event Starts",
    items: [
      "Double-check timeline with vendors",
      "Confirm arrival of all suppliers",
      "Inspect venue setup one final time",
      "Test audio/lighting equipment",
      "Prepare personal belongings and valuables",
      "Ensure wedding rings are ready",
      "Confirm guest seating arrangements",
      "Coordinate bridal party readiness",
      "Review ceremony order with officiant",
      "Take a moment to relax before the ceremony",
    ],
  },
  {
    title: "After the Event",
    items: [
      "Confirm gift collection and transport",
      "Settle remaining vendor payments",
      "Organize cleanup and item pickup",
      "Collect personal belongings and decorations",
      "Back up photos/videos if available",
      "Thank vendors and support team",
      "Review lost-and-found items",
      "Arrange transportation after the event",
      "Store wedding attire properly",
      "Send thank-you messages/cards to guests and vendors",
    ],
  },
] as const;

const BUSINESS_CONFERENCE_CHECKLIST = [
  {
    title: "Conference Planning",
    items: [
      "Define conference goals and target audience",
      "Select conference theme and topics",
      "Set conference date and duration",
      "Establish event budget",
      "Create planning timeline and milestones",
      "Define team roles and responsibilities",
      "Estimate expected number of attendees",
      "Choose event format (in-person, hybrid, virtual)",
      "Identify key sponsors and partners",
      "Prepare risk management and contingency plans",
    ],
  },
  {
    title: "Venue and Logistics",
    items: [
      "Book conference venue",
      "Confirm room capacities and layouts",
      "Arrange stage and seating setup",
      "Verify audio/visual equipment availability",
      "Check internet and Wi-Fi access",
      "Arrange signage and directional materials",
      "Confirm parking and transportation options",
      "Ensure accessibility requirements are met",
      "Review venue safety and emergency procedures",
      "Confirm setup and teardown schedules",
    ],
  },
  {
    title: "Speakers and Agenda",
    items: [
      "Identify and invite speakers",
      "Confirm speaker participation",
      "Collect speaker bios and photos",
      "Prepare conference agenda and schedule",
      "Coordinate presentation requirements",
      "Arrange moderator or host assignments",
      "Confirm panel discussion participants",
      "Schedule networking and break sessions",
      "Prepare backup speakers if needed",
      "Share event timeline with speakers",
    ],
  },
  {
    title: "Registration and Attendee Management",
    items: [
      "Set up registration system",
      "Create ticketing or attendee categories",
      "Prepare attendee confirmation emails",
      "Track registrations and attendance numbers",
      "Organize attendee badges and materials",
      "Prepare welcome packets or swag bags",
      "Set up check-in procedures",
      "Confirm attendee communication channels",
      "Handle dietary and accessibility requests",
      "Prepare attendee support contacts",
    ],
  },
  {
    title: "Marketing and Promotion",
    items: [
      "Create conference branding and visuals",
      "Build event landing page",
      "Promote conference on social media",
      "Send email marketing campaigns",
      "Coordinate sponsor promotions",
      "Prepare press/media outreach",
      "Design promotional materials and banners",
      "Publish speaker announcements",
      "Monitor registration trends",
      "Schedule reminder communications",
    ],
  },
  {
    title: "Technology and Equipment",
    items: [
      "Test microphones and sound systems",
      "Verify projectors and presentation screens",
      "Prepare presentation clickers and adapters",
      "Test video conferencing tools if hybrid/virtual",
      "Arrange live streaming setup if needed",
      "Prepare backup laptops and cables",
      "Confirm charging stations for attendees",
      "Test internet connectivity",
      "Prepare recording equipment",
      "Back up all presentation files",
    ],
  },
  {
    title: "Catering and Hospitality",
    items: [
      "Finalize catering menu",
      "Confirm coffee breaks and meal schedules",
      "Verify attendee dietary requirements",
      "Arrange water stations",
      "Organize VIP or speaker hospitality",
      "Confirm catering setup times",
      "Prepare staff/volunteer meals if needed",
      "Arrange cleanup procedures with caterers",
    ],
  },
  {
    title: "Staffing and Volunteers",
    items: [
      "Recruit event staff or volunteers",
      "Assign event-day responsibilities",
      "Conduct briefing/training sessions",
      "Prepare staff schedules",
      "Share emergency procedures with team",
      "Assign technical support personnel",
      "Prepare communication tools for staff",
      "Confirm dress code or badges for staff",
    ],
  },
  {
    title: "Before the Conference Starts",
    items: [
      "Inspect venue setup",
      "Test all technical equipment",
      "Prepare registration/check-in desk",
      "Verify signage placement",
      "Confirm speaker arrivals",
      "Review event timeline with staff",
      "Prepare emergency contacts and procedures",
      "Ensure catering is ready",
      "Organize attendee materials and badges",
      "Conduct final walkthrough of the venue",
    ],
  },
  {
    title: "During the Conference",
    items: [
      "Monitor attendee check-in flow",
      "Keep sessions running on schedule",
      "Assist speakers and moderators",
      "Monitor audio/video quality",
      "Handle attendee questions and support",
      "Coordinate networking sessions",
      "Manage technical issues quickly",
      "Monitor catering and refreshments",
      "Take photos/videos of the event",
      "Track attendance and participation",
    ],
  },
  {
    title: "After the Conference",
    items: [
      "Thank speakers, sponsors, and attendees",
      "Collect attendee feedback and surveys",
      "Share presentation materials or recordings",
      "Review event performance and metrics",
      "Settle vendor and supplier payments",
      "Organize cleanup and equipment return",
      "Back up photos, videos, and documents",
      "Conduct post-event team review",
      "Prepare final conference report",
      "Plan improvements for future events",
    ],
  },
] as const;

const WORKSHOP_TRAINING_EVENT_CHECKLIST = [
  {
    title: "Event Planning",
    items: [
      "Define workshop/training objectives",
      "Identify target audience",
      "Select workshop topic and format",
      "Set event date and duration",
      "Establish budget and resources",
      "Define success criteria and expected outcomes",
      "Assign roles and responsibilities to organizers",
      "Create event timeline and milestones",
      "Determine participant capacity",
      "Prepare backup plans for unexpected issues",
    ],
  },
  {
    title: "Venue and Logistics",
    items: [
      "Book venue or online platform",
      "Confirm room setup and seating arrangement",
      "Verify audio/visual equipment availability",
      "Check internet and Wi-Fi access",
      "Arrange signage and directions",
      "Ensure accessibility requirements are met",
      "Confirm parking or transportation options",
      "Prepare breakout rooms if needed",
      "Review emergency exits and safety procedures",
      "Confirm setup and cleanup schedules",
    ],
  },
  {
    title: "Agenda and Training Materials",
    items: [
      "Prepare workshop agenda and schedule",
      "Create presentation slides",
      "Prepare training manuals or handouts",
      "Organize exercises and activities",
      "Prepare case studies or demonstrations",
      "Print participant materials if needed",
      "Prepare evaluation or feedback forms",
      "Test all presentation files and media",
      "Organize certificates of participation if applicable",
      "Prepare backup copies of all materials",
    ],
  },
  {
    title: "Trainers and Speakers",
    items: [
      "Confirm trainers or speakers",
      "Share event agenda with trainers",
      "Collect trainer bios and introductions",
      "Review presentation requirements",
      "Arrange rehearsal or preparation session",
      "Confirm travel/accommodation if needed",
      "Prepare moderator or facilitator assignments",
      "Share participant expectations with trainers",
      "Confirm communication methods during the event",
      "Prepare backup trainer if possible",
    ],
  },
  {
    title: "Registration and Participant Management",
    items: [
      "Set up registration system",
      "Send confirmation emails to participants",
      "Track attendee registrations",
      "Prepare name badges or attendee lists",
      "Share workshop schedule and instructions",
      "Handle dietary or accessibility requests",
      "Prepare welcome materials",
      "Organize check-in procedures",
      "Confirm participant communication channels",
      "Send reminders before the event",
    ],
  },
  {
    title: "Technology and Equipment",
    items: [
      "Test microphones and speakers",
      "Verify projector or display screens",
      "Prepare laptops and adapters",
      "Test online meeting platform if virtual/hybrid",
      "Arrange charging stations or extension cords",
      "Prepare backup internet connection if possible",
      "Test interactive tools or software",
      "Bring clickers and presentation remotes",
      "Ensure all devices are fully charged",
      "Prepare recording equipment if needed",
    ],
  },
  {
    title: "Catering and Hospitality",
    items: [
      "Arrange coffee breaks and refreshments",
      "Confirm meal or snack orders",
      "Verify dietary requirements",
      "Prepare water stations",
      "Organize trainer/speaker hospitality",
      "Confirm catering delivery times",
      "Arrange cleanup after catering service",
    ],
  },
  {
    title: "Before the Event Starts",
    items: [
      "Inspect venue or online setup",
      "Test all technical equipment",
      "Organize training materials and supplies",
      "Prepare registration/check-in desk",
      "Verify seating arrangement",
      "Review event schedule with staff/trainers",
      "Confirm arrival of trainers and participants",
      "Prepare emergency contact information",
      "Place signage and directions",
      "Conduct final walkthrough or system check",
    ],
  },
  {
    title: "During the Workshop / Training",
    items: [
      "Welcome participants",
      "Monitor attendance and check-ins",
      "Keep sessions on schedule",
      "Assist trainers with technical needs",
      "Facilitate participant engagement",
      "Monitor audio/video quality",
      "Coordinate breaks and networking time",
      "Handle participant questions and support",
      "Resolve technical or logistical issues quickly",
      "Collect photos/videos if appropriate",
    ],
  },
  {
    title: "After the Event",
    items: [
      "Collect feedback forms and surveys",
      "Thank participants and trainers",
      "Share workshop materials or recordings",
      "Send certificates if applicable",
      "Review event performance and outcomes",
      "Organize cleanup and equipment return",
      "Back up presentations and event files",
      "Document lessons learned",
      "Prepare post-event summary/report",
      "Plan improvements for future workshops",
    ],
  },
] as const;

const ONLINE_WEBINAR_CHECKLIST = [
  {
    title: "Webinar Planning",
    items: [
      "Define webinar topic and objectives",
      "Identify target audience",
      "Select webinar date and time",
      "Determine webinar format and duration",
      "Create webinar agenda and schedule",
      "Define speaker and moderator roles",
      "Set participant capacity if needed",
      "Prepare backup plan for technical issues",
      "Establish success metrics and goals",
      "Confirm legal/privacy requirements if recording",
    ],
  },
  {
    title: "Webinar Platform Setup",
    items: [
      "Select webinar platform",
      "Verify platform subscription and participant limits",
      "Configure webinar settings and permissions",
      "Enable registration if required",
      "Set up waiting room or attendee controls",
      "Configure screen sharing permissions",
      "Test recording functionality",
      "Set up polls, Q&A, or chat features",
      "Customize webinar branding and visuals",
      "Prepare backup meeting link/platform",
    ],
  },
  {
    title: "Presenter Preparation",
    items: [
      "Confirm presenters and moderators",
      "Share agenda and speaking schedule",
      "Prepare presentation slides",
      "Rehearse presentations and timing",
      "Test microphones and cameras",
      "Check lighting and background setup",
      "Prepare speaker notes",
      "Ensure presenters have stable internet connection",
      "Prepare backup devices if needed",
      "Confirm presenter login credentials",
    ],
  },
  {
    title: "Technical Equipment",
    items: [
      "Charge laptops and devices",
      "Test webcam quality",
      "Test microphone and audio quality",
      "Verify headphones or speakers",
      "Prepare backup internet connection",
      "Test screen sharing functionality",
      "Close unnecessary applications",
      "Disable distracting notifications",
      "Prepare power adapters and chargers",
      "Test webinar recording storage availability",
    ],
  },
  {
    title: "Marketing and Registration",
    items: [
      "Create webinar registration page",
      "Send invitation emails",
      "Promote webinar on social media",
      "Share webinar access instructions",
      "Send reminder emails before the event",
      "Track attendee registrations",
      "Prepare attendee confirmation emails",
      "Share calendar invitations",
      "Prepare follow-up communication plan",
      "Confirm attendance expectations",
    ],
  },
  {
    title: "Webinar Content and Materials",
    items: [
      "Finalize presentation slides",
      "Prepare demonstration materials if needed",
      "Organize downloadable resources",
      "Prepare opening and closing remarks",
      "Create audience engagement questions",
      "Prepare polls or quizzes",
      "Organize FAQ responses",
      "Verify all links and media work correctly",
      "Prepare backup copy of presentation files",
      "Test videos or embedded media",
    ],
  },
  {
    title: "Before the Webinar Starts",
    items: [
      "Start webinar platform early",
      "Test audio and video one final time",
      "Verify recording is enabled if needed",
      "Confirm presenters are connected",
      "Open presentation materials",
      "Prepare chat/Q&A moderation tools",
      "Review webinar agenda with presenters",
      "Ensure stable internet connection",
      "Admit participants if using waiting room",
      "Welcome attendees before starting",
    ],
  },
  {
    title: "During the Webinar",
    items: [
      "Introduce presenters and agenda",
      "Monitor audio and video quality",
      "Keep webinar on schedule",
      "Moderate chat and Q&A",
      "Launch polls or engagement activities",
      "Assist presenters with technical issues",
      "Monitor participant attendance",
      "Record important questions or feedback",
      "Handle disruptions or inappropriate behavior",
      "Announce next steps or follow-up information",
    ],
  },
  {
    title: "After the Webinar",
    items: [
      "Stop and save webinar recording",
      "Thank attendees and presenters",
      "Send follow-up emails",
      "Share recording and presentation materials",
      "Review attendee feedback and survey responses",
      "Analyze webinar attendance and engagement metrics",
      "Archive webinar files and recordings",
      "Document lessons learned",
      "Follow up with leads or participants if applicable",
      "Plan improvements for future webinars",
    ],
  },
] as const;

const OFFICE_LAUNCH_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Define office requirements and goals",
      "Establish project budget",
      "Set office launch timeline",
      "Assign responsibilities to project team",
      "Determine office capacity and workspace layout",
      "Confirm legal and compliance requirements",
      "Prepare risk management and contingency plans",
      "Define communication plan for employees and stakeholders",
      "Review lease agreement and office policies",
      "Schedule key milestone reviews",
    ],
  },
  {
    title: "Office Space and Infrastructure",
    items: [
      "Finalize office lease or purchase agreement",
      "Inspect office space condition",
      "Confirm utilities setup (electricity, water, internet)",
      "Arrange office cleaning services",
      "Verify heating, ventilation, and air conditioning systems",
      "Ensure fire safety compliance",
      "Check emergency exits and evacuation plans",
      "Install security systems and access controls",
      "Arrange parking and transportation access",
      "Confirm accessibility requirements are met",
    ],
  },
  {
    title: "Furniture and Equipment",
    items: [
      "Order desks and chairs",
      "Arrange meeting room furniture",
      "Set up storage cabinets and shelves",
      "Install office signage and branding",
      "Prepare kitchen and breakroom equipment",
      "Arrange printers and office devices",
      "Install conference room technology",
      "Verify ergonomic workstation setup",
      "Organize office supplies and stationery",
      "Test all office equipment functionality",
    ],
  },
  {
    title: "IT and Technology Setup",
    items: [
      "Install internet and Wi-Fi network",
      "Configure employee workstations",
      "Set up laptops and desktop computers",
      "Install required software and licenses",
      "Configure email accounts and communication tools",
      "Implement cybersecurity measures",
      "Set up printers and shared devices",
      "Configure backup and recovery systems",
      "Test video conferencing systems",
      "Verify network security and access permissions",
    ],
  },
  {
    title: "Employee Preparation",
    items: [
      "Notify employees about office launch date",
      "Share office access instructions",
      "Prepare onboarding materials if needed",
      "Assign desks and workspaces",
      "Provide office policies and procedures",
      "Arrange employee ID badges or access cards",
      "Schedule orientation or office tour",
      "Confirm remote/hybrid work arrangements if applicable",
      "Prepare emergency contact information",
      "Organize welcome kits or materials",
    ],
  },
  {
    title: "Operations and Administration",
    items: [
      "Register office address where required",
      "Update company contact information",
      "Arrange mail and package handling",
      "Set up cleaning and maintenance contracts",
      "Confirm insurance coverage",
      "Prepare visitor management procedures",
      "Organize waste disposal and recycling",
      "Establish office opening/closing procedures",
      "Set up inventory management for supplies",
      "Verify vendor and supplier agreements",
    ],
  },
  {
    title: "Health and Safety",
    items: [
      "Install first aid kits",
      "Verify fire extinguishers and alarms",
      "Prepare workplace safety guidelines",
      "Conduct safety inspections",
      "Confirm emergency response procedures",
      "Ensure ergonomic workstation setup",
      "Arrange sanitation and hygiene supplies",
      "Prepare incident reporting procedures",
      "Test emergency lighting systems",
      "Schedule safety training if required",
    ],
  },
  {
    title: "Before Office Opening",
    items: [
      "Conduct final office walkthrough",
      "Test all utilities and systems",
      "Verify internet and phone connectivity",
      "Ensure furniture and equipment are installed",
      "Organize meeting rooms and common areas",
      "Stock kitchen and office supplies",
      "Confirm security systems are active",
      "Test employee access systems",
      "Verify cleanliness and presentation of office",
      "Communicate final launch details to staff",
    ],
  },
  {
    title: "Office Launch Day",
    items: [
      "Welcome employees and guests",
      "Conduct office orientation or tour",
      "Monitor IT and facility systems",
      "Assist employees with setup issues",
      "Confirm meeting rooms and shared spaces work properly",
      "Handle operational issues quickly",
      "Ensure reception and visitor management are functioning",
      "Gather initial employee feedback",
      "Document launch-day issues and resolutions",
      "Celebrate successful office opening",
    ],
  },
  {
    title: "After Launch",
    items: [
      "Review office operations and workflows",
      "Collect employee feedback",
      "Resolve outstanding setup issues",
      "Monitor office supply levels",
      "Schedule regular maintenance and cleaning",
      "Review security and access logs",
      "Evaluate office space utilization",
      "Update operational documentation",
      "Plan improvements and optimizations",
      "Conduct post-launch project review",
    ],
  },
] as const;

const MOVING_NEW_HOME_CHECKLIST = [
  {
    title: "Planning and Preparation",
    items: [
      "Confirm moving date and schedule",
      "Notify landlord or current property manager if applicable",
      "Hire moving company or arrange transportation",
      "Create moving budget",
      "Prepare inventory of belongings",
      "Gather packing supplies and boxes",
      "Label boxes by room and contents",
      "Arrange storage if needed",
      "Prepare emergency contact information",
      "Share new address with family and friends",
    ],
  },
  {
    title: "Address and Administrative Updates",
    items: [
      "Update mailing address",
      "Notify banks and financial institutions",
      "Update insurance information",
      "Change address for subscriptions and deliveries",
      "Update driver's license or ID if required",
      "Notify employer and schools",
      "Transfer or set up utilities",
      "Update voter registration if applicable",
      "Notify healthcare providers",
      "Save copies of important moving documents",
    ],
  },
  {
    title: "Packing and Organization",
    items: [
      "Sort and declutter belongings",
      "Donate or discard unnecessary items",
      "Pack fragile items securely",
      "Prepare essentials box for first day/night",
      "Pack valuables separately",
      "Label important boxes clearly",
      "Disassemble large furniture if needed",
      "Secure cables and electronics",
      "Pack cleaning supplies for move-in",
      "Prepare toolkit for furniture assembly",
    ],
  },
  {
    title: "Utilities and Services",
    items: [
      "Activate electricity and water services",
      "Set up internet and Wi-Fi",
      "Arrange gas service if needed",
      "Verify heating and cooling systems",
      "Test smoke detectors and alarms",
      "Confirm garbage and recycling services",
      "Check plumbing and water pressure",
      "Verify all lights and outlets work",
      "Arrange home security system if desired",
      "Prepare spare keys",
    ],
  },
  {
    title: "Before Moving Day",
    items: [
      "Confirm moving company arrival time",
      "Reserve elevator or parking if necessary",
      "Charge phones and electronic devices",
      "Prepare snacks and water",
      "Clean current home before leaving",
      "Defrost refrigerator/freezer if moving appliances",
      "Secure important documents and valuables",
      "Check weather forecast",
      "Pack overnight bag",
      "Do final walkthrough of old home",
    ],
  },
  {
    title: "Arrival at the New Home",
    items: [
      "Inspect home for damage or issues",
      "Verify utilities are working",
      "Unlock and secure all entrances",
      "Check heating, cooling, and ventilation",
      "Confirm internet setup",
      "Locate circuit breaker and water shutoff",
      "Test smoke detectors and locks",
      "Direct movers to correct rooms",
      "Assemble essential furniture first",
      "Unpack essentials box",
    ],
  },
  {
    title: "Cleaning and Setup",
    items: [
      "Clean kitchen and bathrooms",
      "Wipe surfaces and floors",
      "Install shower curtains and toiletries",
      "Set up beds and bedding",
      "Organize kitchen essentials",
      "Arrange furniture placement",
      "Set up workspace or office area",
      "Install curtains or blinds if needed",
      "Dispose of packing materials and trash",
      "Organize storage spaces",
    ],
  },
  {
    title: "Safety and Security",
    items: [
      "Change locks if necessary",
      "Test home alarm/security systems",
      "Locate emergency exits",
      "Prepare first aid kit",
      "Check fire extinguishers",
      "Verify outdoor lighting",
      "Secure windows and doors",
      "Save local emergency numbers",
      "Meet neighbors if possible",
      "Review neighborhood safety information",
    ],
  },
  {
    title: "After Moving In",
    items: [
      "Unpack remaining boxes gradually",
      "Organize closets and storage areas",
      "Register appliances or warranties if needed",
      "Check for maintenance or repair needs",
      "Confirm all mail is arriving correctly",
      "Update online delivery addresses",
      "Explore local services and stores",
      "Set up regular cleaning routine",
      "Review moving expenses and receipts",
      "Celebrate settling into the new home",
    ],
  },
] as const;

const RENTAL_PROPERTY_INSPECTION_CHECKLIST = [
  {
    title: "Legal and Documentation",
    items: [
      "Verify property ownership documents",
      "Prepare rental agreement or lease contract",
      "Confirm local rental regulations and compliance",
      "Check property insurance coverage",
      "Prepare inventory list for furnished properties",
      "Verify utility account setup",
      "Prepare emergency contact information",
      "Confirm smoke and safety certifications if required",
      "Organize copies of keys and access devices",
      "Prepare tenant information package",
    ],
  },
  {
    title: "Exterior Inspection",
    items: [
      "Inspect roof for visible damage or leaks",
      "Check gutters and drainage systems",
      "Inspect exterior walls and paint condition",
      "Verify doors and locks function properly",
      "Check windows for damage and proper sealing",
      "Inspect outdoor lighting",
      "Verify fences and gates are secure",
      "Check driveway and walkways for hazards",
      "Inspect garden or landscaping condition",
      "Remove debris and clean exterior areas",
    ],
  },
  {
    title: "Interior General Inspection",
    items: [
      "Inspect walls, ceilings, and floors for damage",
      "Check doors and handles",
      "Verify all locks work correctly",
      "Test windows and blinds",
      "Inspect stairs and railings for safety",
      "Ensure all rooms are clean and odor-free",
      "Verify proper ventilation",
      "Check for signs of mold or moisture",
      "Confirm pest control issues are resolved",
      "Inspect storage spaces and closets",
    ],
  },
  {
    title: "Electrical System",
    items: [
      "Test all light switches and fixtures",
      "Verify power outlets function properly",
      "Inspect circuit breakers and fuse box",
      "Check smoke detectors and carbon monoxide alarms",
      "Test intercom or security systems if applicable",
      "Verify internet/cable connections",
      "Replace burnt-out light bulbs",
      "Ensure extension cords are removed or organized safely",
    ],
  },
  {
    title: "Plumbing and Water Systems",
    items: [
      "Test sinks, faucets, and showers",
      "Check toilets for leaks or flushing issues",
      "Inspect water pressure",
      "Verify hot water system functionality",
      "Check under sinks for leaks",
      "Test drains for proper flow",
      "Inspect washing machine connections",
      "Verify dishwasher operation if included",
      "Ensure no visible pipe damage",
    ],
  },
  {
    title: "Kitchen Inspection",
    items: [
      "Test stove and oven functionality",
      "Verify refrigerator operation",
      "Inspect microwave and appliances",
      "Check kitchen cabinets and drawers",
      "Ensure countertops are clean and undamaged",
      "Test exhaust fan or ventilation system",
      "Verify sink and garbage disposal functionality",
      "Inspect tile and backsplash condition",
      "Ensure fire extinguisher is available if required",
    ],
  },
  {
    title: "Bathroom Inspection",
    items: [
      "Inspect shower, bathtub, and sink condition",
      "Test toilet functionality",
      "Verify ventilation fan operation",
      "Check mirrors and cabinets",
      "Inspect tiles and grout for damage",
      "Ensure water drains properly",
      "Test towel racks and fixtures",
      "Confirm no mold or mildew is present",
    ],
  },
  {
    title: "Heating, Cooling, and Safety",
    items: [
      "Test heating system",
      "Test air conditioning system",
      "Replace HVAC filters if needed",
      "Verify thermostat operation",
      "Inspect fire extinguishers",
      "Confirm emergency exits are accessible",
      "Test security alarms if installed",
      "Verify all safety equipment is operational",
    ],
  },
  {
    title: "Cleaning and Presentation",
    items: [
      "Deep clean all rooms",
      "Clean windows and mirrors",
      "Vacuum and mop floors",
      "Remove personal belongings",
      "Neutralize odors",
      "Organize furniture if furnished",
      "Improve lighting and presentation",
      "Ensure property is photo-ready for listings",
      "Prepare welcome or instruction materials for tenants",
    ],
  },
  {
    title: "Final Pre-Rental Review",
    items: [
      "Conduct final walkthrough inspection",
      "Take photos/videos of property condition",
      "Verify all repairs are completed",
      "Test all appliances one final time",
      "Confirm utilities are active",
      "Ensure keys/access devices are ready",
      "Review rental listing accuracy",
      "Prepare move-in checklist for tenant",
      "Confirm contact information for maintenance issues",
      "Lock and secure property after inspection",
    ],
  },
] as const;

const AIRBNB_GUEST_PREPARATION_CHECKLIST = [
  {
    title: "Booking and Communication",
    items: [
      "Confirm reservation details",
      "Send check-in instructions to guest",
      "Share property address and directions",
      "Provide Wi-Fi information",
      "Confirm arrival and departure times",
      "Answer guest questions before arrival",
      "Share parking instructions if applicable",
      "Provide emergency contact information",
      "Send house rules and policies",
      "Confirm number of guests",
    ],
  },
  {
    title: "Cleaning and Hygiene",
    items: [
      "Deep clean all rooms",
      "Vacuum and mop floors",
      "Dust furniture and surfaces",
      "Clean windows and mirrors",
      "Sanitize bathroom and kitchen areas",
      "Empty trash bins",
      "Replace trash bags",
      "Wash and change bed linens",
      "Replace towels and toiletries",
      "Eliminate odors and improve ventilation",
    ],
  },
  {
    title: "Bedroom Preparation",
    items: [
      "Make beds with clean linens",
      "Provide extra pillows and blankets",
      "Ensure bedside lighting works",
      "Prepare hangers and closet space",
      "Check curtains or blinds functionality",
      "Place fresh towels in room",
      "Provide charging outlets access",
      "Ensure room temperature is comfortable",
      "Remove personal belongings from guest areas",
    ],
  },
  {
    title: "Bathroom Preparation",
    items: [
      "Clean toilet, sink, shower, and bathtub",
      "Refill soap, shampoo, and toilet paper",
      "Provide clean towels and bath mats",
      "Check hot water availability",
      "Ensure drains work properly",
      "Test bathroom lighting and ventilation",
      "Place waste bin with liner",
      "Inspect for leaks or maintenance issues",
    ],
  },
  {
    title: "Kitchen Preparation",
    items: [
      "Clean countertops and appliances",
      "Empty refrigerator of old items",
      "Provide basic cooking utensils",
      "Check stove, oven, and microwave functionality",
      "Refill coffee, tea, sugar, or essentials if offered",
      "Ensure dishes and cutlery are clean",
      "Empty dishwasher if necessary",
      "Verify garbage disposal and trash setup",
      "Provide cleaning supplies or instructions",
    ],
  },
  {
    title: "Safety and Maintenance",
    items: [
      "Test smoke detectors",
      "Check carbon monoxide detectors",
      "Verify fire extinguisher availability",
      "Inspect locks and door security",
      "Ensure emergency exits are accessible",
      "Test heating and air conditioning",
      "Verify internet and Wi-Fi functionality",
      "Check all lights and electrical outlets",
      "Inspect plumbing and water pressure",
      "Fix visible maintenance issues",
    ],
  },
  {
    title: "Guest Experience and Comfort",
    items: [
      "Prepare welcome message or guidebook",
      "Provide local recommendations and maps",
      "Ensure TV and entertainment systems work",
      "Add decorative touches for presentation",
      "Provide spare keys or smart lock instructions",
      "Check outdoor areas and seating",
      "Ensure adequate lighting around entrances",
      "Prepare information about public transport or nearby stores",
      "Stock extra essentials if possible",
    ],
  },
  {
    title: "Before Guest Arrival",
    items: [
      "Conduct final walkthrough inspection",
      "Double-check cleanliness and presentation",
      "Ensure property smells fresh",
      "Set comfortable room temperature",
      "Confirm check-in instructions were sent",
      "Prepare self-check-in setup if applicable",
      "Ensure keys/access codes are ready",
      "Verify parking availability",
      "Turn on exterior lights if arriving late",
      "Secure personal or restricted areas",
    ],
  },
  {
    title: "During Guest Stay",
    items: [
      "Be available for questions or emergencies",
      "Respond promptly to guest messages",
      "Monitor any maintenance issues",
      "Respect guest privacy",
      "Offer assistance if needed",
      "Track check-out schedule",
    ],
  },
  {
    title: "After Guest Check-Out",
    items: [
      "Inspect property for damage",
      "Collect forgotten items",
      "Wash linens and towels",
      "Deep clean property again",
      "Restock supplies and toiletries",
      "Check appliances and utilities",
      "Dispose of trash properly",
      "Reset locks or access codes if needed",
      "Review guest feedback",
      "Prepare property for next booking",
    ],
  },
] as const;

const CAR_SERVICE_CHECKLIST = [
  {
    title: "Service Planning",
    items: [
      "Schedule service appointment",
      "Review recommended maintenance intervals",
      "Identify current vehicle issues or warning signs",
      "Check warranty or service coverage",
      "Confirm service center location and hours",
      "Prepare estimated service budget",
      "Review previous service records",
      "Verify roadside assistance information",
      "Arrange transportation during service if needed",
      "Confirm required parts availability if known",
    ],
  },
  {
    title: "Vehicle Inspection Before Service",
    items: [
      "Check fuel level",
      "Inspect tire pressure and condition",
      "Note unusual noises or vibrations",
      "Check dashboard warning lights",
      "Inspect windshield and wipers",
      "Check exterior lights functionality",
      "Inspect fluid leak signs",
      "Test brakes for unusual behavior",
      "Verify air conditioning/heating operation",
      "Record current mileage",
    ],
  },
  {
    title: "Documentation and Information",
    items: [
      "Bring vehicle registration documents",
      "Carry insurance information",
      "Prepare warranty documents if applicable",
      "Bring service history records",
      "Prepare list of issues to report",
      "Save contact information for service center",
      "Confirm appointment confirmation details",
      "Prepare payment method",
    ],
  },
  {
    title: "Cleaning and Organization",
    items: [
      "Remove personal valuables from vehicle",
      "Empty unnecessary items from trunk",
      "Organize important documents",
      "Remove trash from interior",
      "Secure loose objects inside vehicle",
      "Remove child seats if necessary",
      "Clean vehicle enough for inspection access",
      "Ensure service technicians can access key areas",
    ],
  },
  {
    title: "Maintenance Requests Preparation",
    items: [
      "List requested maintenance services",
      "Note unusual sounds or driving behavior",
      "Identify performance issues",
      "Report fuel consumption concerns",
      "Mention warning lights or error messages",
      "Request tire rotation/alignment if needed",
      "Confirm oil change requirements",
      "Specify any accessory or electronics issues",
      "Prepare questions about future maintenance",
    ],
  },
  {
    title: "Technology and Security",
    items: [
      "Save radio/navigation settings if necessary",
      "Back up important navigation data",
      "Disable or remove dashcam if preferred",
      "Remove connected personal devices",
      "Prepare spare key if required",
      "Verify alarm/security instructions if needed",
      "Record current vehicle condition with photos if desired",
    ],
  },
  {
    title: "Before Leaving for Service",
    items: [
      "Double-check appointment time",
      "Verify service center address",
      "Check traffic and travel time",
      "Bring phone charger and essentials",
      "Confirm transportation home/work",
      "Ensure enough fuel to reach service center",
      "Lock or secure personal compartments",
      "Prepare emergency contacts if needed",
      "Arrive a few minutes early",
    ],
  },
  {
    title: "At the Service Center",
    items: [
      "Explain all vehicle concerns clearly",
      "Review requested services with technician/advisor",
      "Confirm estimated completion time",
      "Request cost estimate before work begins",
      "Ask about additional recommended services",
      "Confirm contact number for updates",
      "Clarify warranty coverage if applicable",
      "Review payment options",
      "Verify pickup instructions",
    ],
  },
  {
    title: "After Service Completion",
    items: [
      "Review completed service report",
      "Confirm all requested work was performed",
      "Check invoice and charges carefully",
      "Ask questions about recommendations",
      "Verify warning lights are cleared",
      "Test vehicle briefly before leaving",
      "Ensure service reminder was reset if applicable",
      "Store service records safely",
      "Schedule next maintenance if needed",
      "Monitor vehicle performance after service",
    ],
  },
] as const;

const PRE_TRIP_CAR_INSPECTION_CHECKLIST = [
  {
    title: "Engine and Fluids",
    items: [
      "Check engine oil level",
      "Inspect coolant level",
      "Check brake fluid level",
      "Verify power steering fluid level",
      "Inspect transmission fluid if applicable",
      "Check windshield washer fluid",
      "Inspect for visible fluid leaks under the car",
      "Verify fuel level is sufficient",
      "Check for unusual engine noises",
      "Inspect engine bay for loose components",
    ],
  },
  {
    title: "Tires and Wheels",
    items: [
      "Check tire pressure on all tires",
      "Inspect tire tread depth",
      "Look for tire damage or cracks",
      "Verify spare tire condition and pressure",
      "Check wheel bolts/nuts tightness",
      "Inspect rims for visible damage",
      "Confirm tire repair kit availability if applicable",
      "Test tire pressure monitoring system if installed",
    ],
  },
  {
    title: "Brakes and Suspension",
    items: [
      "Test brake pedal responsiveness",
      "Check parking brake operation",
      "Listen for unusual brake noises",
      "Inspect brake discs/pads visually if possible",
      "Test suspension for unusual movement or sounds",
      "Verify steering responsiveness",
      "Check for vibrations while steering",
    ],
  },
  {
    title: "Lights and Electrical Systems",
    items: [
      "Test headlights (low and high beam)",
      "Check brake lights",
      "Test turn signals",
      "Verify hazard lights",
      "Check reverse lights",
      "Inspect interior lighting",
      "Test horn functionality",
      "Verify dashboard warning lights",
      "Check battery condition if possible",
      "Test charging ports and electrical accessories",
    ],
  },
  {
    title: "Windows and Visibility",
    items: [
      "Inspect windshield for cracks or chips",
      "Test windshield wipers",
      "Verify washer spray operation",
      "Clean windows and mirrors",
      "Check side mirrors adjustment",
      "Inspect rearview mirror stability",
      "Ensure defrosters work properly",
    ],
  },
  {
    title: "Safety Equipment",
    items: [
      "Verify first aid kit availability",
      "Check fire extinguisher if carried",
      "Ensure warning triangle is available",
      "Pack reflective safety vest",
      "Confirm emergency roadside kit availability",
      "Carry jumper cables or jump starter",
      "Verify flashlight and spare batteries",
      "Pack towing rope if appropriate",
      "Carry spare fuses if needed",
    ],
  },
  {
    title: "Interior and Comfort",
    items: [
      "Test air conditioning and heating",
      "Verify seat adjustments",
      "Check seat belt functionality",
      "Secure loose items in vehicle",
      "Organize luggage properly",
      "Prepare phone charger and mounts",
      "Test infotainment/navigation system",
      "Ensure sufficient drinking water is packed",
    ],
  },
  {
    title: "Documents and Legal Requirements",
    items: [
      "Carry driver's license",
      "Bring vehicle registration documents",
      "Verify insurance validity",
      "Prepare roadside assistance information",
      "Check toll/payment devices if needed",
      "Carry spare vehicle key if available",
      "Save emergency contact numbers",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Start engine and monitor dashboard indicators",
      "Listen for unusual sounds during idle",
      "Test brakes at low speed",
      "Verify GPS/navigation route",
      "Check weather and road conditions",
      "Confirm fuel stations along route",
      "Double-check luggage security",
      "Ensure all passengers are ready",
      "Lock doors and secure valuables",
      "Begin trip with full attention and rest",
    ],
  },
  {
    title: "During the Trip",
    items: [
      "Monitor dashboard warning lights",
      "Watch engine temperature gauge",
      "Check tire condition during stops",
      "Monitor fuel consumption",
      "Listen for unusual noises or vibrations",
      "Take regular driving breaks",
      "Recheck luggage security if needed",
      "Stay alert for changing weather conditions",
      "Inspect vehicle briefly during long stops",
      "Refuel before reaching critically low levels",
    ],
  },
] as const;

const OFF_ROAD_EXPEDITION_CHECKLIST = [
  {
    title: "Expedition Planning",
    items: [
      "Define expedition route and destinations",
      "Research terrain and trail conditions",
      "Check weather forecast for the entire route",
      "Identify fuel stations and supply points",
      "Share itinerary with emergency contacts",
      "Confirm permits or access permissions if required",
      "Plan emergency evacuation routes",
      "Estimate travel duration and daily distances",
      "Prepare offline maps and GPS routes",
      "Coordinate communication plan with group members",
    ],
  },
  {
    title: "Vehicle Inspection and Preparation",
    items: [
      "Perform full vehicle maintenance check",
      "Inspect engine oil and fluids",
      "Check coolant and brake fluid levels",
      "Inspect tires and adjust pressure for terrain",
      "Verify spare tire condition",
      "Test battery and charging system",
      "Inspect suspension and undercarriage",
      "Check recovery points and tow hooks",
      "Test lights and electrical systems",
      "Confirm fuel tank is full",
    ],
  },
  {
    title: "Recovery and Off-Road Equipment",
    items: [
      "Pack recovery straps and tow ropes",
      "Bring winch and accessories if available",
      "Carry traction boards",
      "Pack shovel and recovery tools",
      "Bring high-lift or off-road jack",
      "Carry tire repair kit",
      "Pack portable air compressor",
      "Bring spare fuses and tools",
      "Carry extra engine fluids",
      "Pack work gloves and protective gear",
    ],
  },
  {
    title: "Navigation and Communication",
    items: [
      "Bring GPS navigation device",
      "Download offline maps",
      "Carry paper maps and compass",
      "Test radios or communication devices",
      "Pack satellite communicator if needed",
      "Bring phone chargers and power banks",
      "Verify emergency contact numbers",
      "Prepare emergency signaling equipment",
      "Check mobile network coverage areas",
    ],
  },
  {
    title: "Camping and Survival Supplies",
    items: [
      "Pack tent and sleeping gear",
      "Bring weather-appropriate clothing",
      "Carry sufficient food supplies",
      "Pack drinking water and purification system",
      "Bring portable cooking equipment",
      "Pack fire-starting tools",
      "Carry first aid kit",
      "Prepare emergency blankets",
      "Bring insect repellent and sunscreen",
      "Pack trash bags for waste management",
    ],
  },
  {
    title: "Safety and Emergency Preparation",
    items: [
      "Review emergency procedures with group",
      "Prepare medical and allergy information",
      "Carry fire extinguisher",
      "Inspect first aid supplies",
      "Pack emergency shelter equipment",
      "Monitor weather alerts before departure",
      "Identify nearest emergency services",
      "Prepare backup transportation plan",
      "Verify insurance coverage for off-road travel",
      "Ensure all participants know the route plan",
    ],
  },
  {
    title: "Personal Gear and Clothing",
    items: [
      "Pack waterproof clothing",
      "Bring hiking or off-road boots",
      "Pack gloves and hats",
      "Carry sunglasses and eye protection",
      "Prepare extra clothing layers",
      "Bring personal hygiene supplies",
      "Pack flashlight or headlamp",
      "Carry personal medications",
      "Prepare waterproof bags for electronics",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all packed equipment",
      "Secure all cargo inside vehicle",
      "Charge all electronic devices",
      "Confirm fuel and water supplies",
      "Review weather and route updates",
      "Test communication equipment",
      "Inform emergency contact before leaving",
      "Verify tire pressure one final time",
      "Conduct final vehicle walkaround inspection",
      "Leave early to maximize daylight travel",
    ],
  },
  {
    title: "During the Expedition",
    items: [
      "Monitor fuel and water levels",
      "Check vehicle condition regularly",
      "Adjust tire pressure when needed",
      "Watch for terrain and weather hazards",
      "Maintain communication with group",
      "Take regular rest breaks",
      "Follow designated trails and regulations",
      "Avoid unnecessary risks or aggressive driving",
      "Secure campsite safely overnight",
      "Keep emergency equipment accessible",
    ],
  },
  {
    title: "After the Expedition",
    items: [
      "Inspect vehicle for damage",
      "Clean vehicle and recovery equipment",
      "Refill and recharge used supplies",
      "Dispose of waste properly",
      "Review expedition notes and route performance",
      "Back up GPS tracks and photos",
      "Repair or replace damaged gear",
      "Schedule post-trip vehicle maintenance",
      "Notify emergency contacts of safe return",
      "Store equipment properly for future use",
    ],
  },
] as const;

const FISHING_TRIP_CHECKLIST = [
  {
    title: "Trip Planning",
    items: [
      "Choose fishing destination",
      "Check fishing season and local regulations",
      "Verify fishing license requirements",
      "Review weather forecast",
      "Check water and tide conditions if applicable",
      "Plan transportation and route",
      "Inform someone about trip location and schedule",
      "Research target fish species",
      "Confirm boat reservations if needed",
      "Prepare emergency contact information",
    ],
  },
  {
    title: "Fishing Equipment",
    items: [
      "Pack fishing rods and reels",
      "Bring appropriate fishing line",
      "Pack hooks, sinkers, and swivels",
      "Prepare lures and bait",
      "Bring tackle box",
      "Pack fishing net",
      "Carry pliers and line cutters",
      "Bring rod holders if needed",
      "Pack extra fishing gear and spare parts",
      "Test equipment before departure",
    ],
  },
  {
    title: "Boat and Water Safety (if applicable)",
    items: [
      "Inspect boat condition",
      "Check fuel level",
      "Verify battery charge",
      "Test navigation lights",
      "Bring life jackets for all participants",
      "Pack emergency whistle or signaling device",
      "Carry anchor and rope",
      "Test communication devices",
      "Prepare emergency flotation equipment",
      "Check weather and water safety advisories",
    ],
  },
  {
    title: "Clothing and Personal Gear",
    items: [
      "Pack weather-appropriate clothing",
      "Bring waterproof jacket",
      "Wear non-slip footwear",
      "Pack hat and sunglasses",
      "Bring sunscreen",
      "Carry insect repellent",
      "Pack extra clothes and socks",
      "Bring gloves if necessary",
      "Prepare towels or wet wipes",
      "Carry waterproof bags for valuables",
    ],
  },
  {
    title: "Food and Water Supplies",
    items: [
      "Pack drinking water",
      "Bring snacks and meals",
      "Carry cooler with ice if needed",
      "Pack reusable utensils and cups",
      "Prepare coffee or hot drinks if desired",
      "Bring trash bags for waste disposal",
      "Store food securely from wildlife",
    ],
  },
  {
    title: "Navigation and Technology",
    items: [
      "Bring GPS or navigation device",
      "Download offline maps if necessary",
      "Charge phones and electronic devices",
      "Pack power bank or chargers",
      "Bring camera or binoculars",
      "Save emergency numbers and marina contacts",
      "Test fish finder or sonar equipment if used",
    ],
  },
  {
    title: "Safety and Emergency Supplies",
    items: [
      "Pack first aid kit",
      "Carry flashlight or headlamp",
      "Bring spare batteries",
      "Prepare emergency blanket",
      "Carry fire starter or waterproof matches",
      "Bring multitool or knife",
      "Pack personal medications",
      "Verify communication device functionality",
      "Review emergency procedures with group",
    ],
  },
  {
    title: "Before Departure",
    items: [
      "Double-check all fishing gear",
      "Confirm licenses and permits are packed",
      "Fuel vehicle or boat",
      "Review weather forecast again",
      "Verify bait and supplies are ready",
      "Secure equipment for transport",
      "Lock home and secure valuables",
      "Leave itinerary with trusted contact",
      "Ensure all participants are ready",
      "Depart with enough time before sunrise/tide if needed",
    ],
  },
  {
    title: "During the Fishing Trip",
    items: [
      "Follow local fishing regulations",
      "Monitor weather conditions",
      "Stay hydrated",
      "Keep hooks and sharp tools safely stored",
      "Maintain safe distance between anglers",
      "Handle fish safely and responsibly",
      "Respect wildlife and environment",
      "Monitor fuel and battery levels if boating",
      "Keep communication devices accessible",
      "Use sun protection regularly",
    ],
  },
  {
    title: "After the Trip",
    items: [
      "Clean fishing gear and equipment",
      "Dispose of waste properly",
      "Store fish safely if keeping catch",
      "Inspect rods, reels, and lines for damage",
      "Recharge batteries and electronics",
      "Wash and dry clothing and gear",
      "Log trip details or catches if desired",
      "Refill used supplies",
      "Notify contacts of safe return",
      "Store equipment properly for next trip",
    ],
  },
] as const;

const SAMPLE_USERS = [
  { email: "steve@gmail.com", name: "Steve" },
  { email: "peter@gmail.com", name: "Peter" },
  { email: "dave@gmail.com", name: "Dave" },
  { email: "john@gmail.com", name: "John" },
  { email: "nick@gmail.com", name: "Nick" },
  ...Array.from({ length: 9 }, (_, index) => {
    const userNumber = index + 1;

    return {
      email: `user${userNumber}@gmail.com`,
      name: `User ${userNumber}`,
    };
  }),
] as const;

async function findOrCreateSystemAdmin() {
  const email = "system-admin@checklisthub.local";
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return existingUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      email,
      name: "ChecklistHub System Admin",
      passwordHash: await hash(randomUUID()),
      role: "admin",
    })
    .returning();

  return createdUser;
}

async function seedSampleUsers() {
  const passwordHash = await hash("pass123");

  for (const user of SAMPLE_USERS) {
    await db
      .insert(users)
      .values({
        ...user,
        passwordHash,
        role: "user",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: user.name,
          passwordHash,
          role: "user",
        },
      });
  }
}

async function seedScubaDivingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Diving",
      slug: "diving",
      description: "Checklist templates for scuba diving and other underwater activities.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Diving",
        description: "Checklist templates for scuba diving and other underwater activities.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Scuba Diving",
      slug: "scuba-diving",
      description: "Preparation and safety workflows for recreational scuba dives.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Scuba Diving",
        description: "Preparation and safety workflows for recreational scuba dives.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Scuba Diving Preparation Checklist",
      slug: "scuba-diving-preparation-checklist",
      description:
        "A comprehensive pre-dive, in-water, and post-dive checklist for recreational scuba diving preparation.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Scuba Diving Preparation Checklist",
        description:
          "A comprehensive pre-dive, in-water, and post-dive checklist for recreational scuba diving preparation.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of SCUBA_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedDronePreflightTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Drone Operations",
      slug: "drone-operations",
      description: "Checklist templates for drone flights, missions, and equipment readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Drone Operations",
        description: "Checklist templates for drone flights, missions, and equipment readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Drone Pre-Flight",
      slug: "drone-pre-flight",
      description: "Pre-flight safety and equipment checks for drone operators.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Drone Pre-Flight",
        description: "Pre-flight safety and equipment checks for drone operators.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Pre-Flight Preparation Checklist for Drone Operators",
      slug: "drone-operator-pre-flight-preparation-checklist",
      description:
        "A practical drone operator checklist covering personal readiness, aircraft inspection, environment assessment, flight setup, flight monitoring, and post-flight actions.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Pre-Flight Preparation Checklist for Drone Operators",
        description:
          "A practical drone operator checklist covering personal readiness, aircraft inspection, environment assessment, flight setup, flight monitoring, and post-flight actions.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of DRONE_PREFLIGHT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedInternationalTravelTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Travel",
      slug: "travel",
      description: "Checklist templates for trip planning, packing, and travel safety.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Travel",
        description: "Checklist templates for trip planning, packing, and travel safety.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "International Travel",
      slug: "international-travel",
      description: "Preparation workflows for international trips and airport departure.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "International Travel",
        description: "Preparation workflows for international trips and airport departure.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for International Travel Checklist",
      slug: "preparation-for-international-travel-checklist",
      description:
        "A comprehensive international travel checklist covering documents, money, health, packing, home preparation, airport departure, and travel safety.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for International Travel Checklist",
        description:
          "A comprehensive international travel checklist covering documents, money, health, packing, home preparation, airport departure, and travel safety.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of INTERNATIONAL_TRAVEL_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedCampingHikingTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Camping and Hiking",
      slug: "camping-and-hiking",
      description: "Trip planning, packing, campsite, hiking, and return-home preparation.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Camping and Hiking",
        description: "Trip planning, packing, campsite, hiking, and return-home preparation.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Camping and Hiking Checklist",
      slug: "camping-and-hiking-checklist",
      description:
        "A complete camping and hiking checklist for planning, gear, food, safety, campsite setup, trail awareness, and cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Camping and Hiking Checklist",
        description:
          "A complete camping and hiking checklist for planning, gear, food, safety, campsite setup, trail awareness, and cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CAMPING_HIKING_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedTentCampingTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Tent Camping Trip",
      slug: "tent-camping-trip",
      description: "Planning, packing, setup, trip management, and cleanup for tent camping.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Tent Camping Trip",
        description: "Planning, packing, setup, trip management, and cleanup for tent camping.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Organizing a Camping Trip with a Tent Checklist",
      slug: "organizing-a-camping-trip-with-a-tent-checklist",
      description:
        "A tent camping checklist covering planning, shelter gear, clothing, cooking, safety, camp setup, recreation, travel prep, trip routines, and return-home cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Organizing a Camping Trip with a Tent Checklist",
        description:
          "A tent camping checklist covering planning, shelter gear, clothing, cooking, safety, camp setup, recreation, travel prep, trip routines, and return-home cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of TENT_CAMPING_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedRoadTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Travel",
      slug: "travel",
      description: "Checklist templates for trip planning, packing, and travel safety.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Travel",
        description: "Checklist templates for trip planning, packing, and travel safety.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Road Trip",
      slug: "road-trip",
      description: "Route planning, vehicle readiness, packing, driving safety, and arrival tasks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Road Trip",
        description: "Route planning, vehicle readiness, packing, driving safety, and arrival tasks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for a Road Trip Checklist",
      slug: "preparation-for-a-road-trip-checklist",
      description:
        "A road trip preparation checklist covering route planning, vehicle inspection, emergency supplies, documents, packing, navigation, comfort, departure, driving, and arrival.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for a Road Trip Checklist",
        description:
          "A road trip preparation checklist covering route planning, vehicle inspection, emergency supplies, documents, packing, navigation, comfort, departure, driving, and arrival.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of ROAD_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedPhotoShootTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Photography and Media",
      slug: "photography-and-media",
      description: "Checklist templates for photography, video, and creative production work.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Photography and Media",
        description: "Checklist templates for photography, video, and creative production work.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Photo Shoot",
      slug: "photo-shoot",
      description: "Planning, equipment, team coordination, shooting, and file management.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Photo Shoot",
        description: "Planning, equipment, team coordination, shooting, and file management.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for a Photo Shoot Checklist",
      slug: "preparation-for-a-photo-shoot-checklist",
      description:
        "A photo shoot preparation checklist covering planning, camera and lighting gear, styling, team coordination, file management, shoot execution, and wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for a Photo Shoot Checklist",
        description:
          "A photo shoot preparation checklist covering planning, camera and lighting gear, styling, team coordination, file management, shoot execution, and wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of PHOTO_SHOOT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedVideoProductionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Photography and Media",
      slug: "photography-and-media",
      description: "Checklist templates for photography, video, and creative production work.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Photography and Media",
        description: "Checklist templates for photography, video, and creative production work.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Video Production",
      slug: "video-production",
      description: "Planning, filming day preparation, crew coordination, and media management.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Video Production",
        description: "Planning, filming day preparation, crew coordination, and media management.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for Video Production / Filming Day Checklist",
      slug: "preparation-for-video-production-filming-day-checklist",
      description:
        "A filming day checklist covering pre-production, camera, audio, lighting, set prep, crew coordination, file management, filming, and wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for Video Production / Filming Day Checklist",
        description:
          "A filming day checklist covering pre-production, camera, audio, lighting, set prep, crew coordination, file management, filming, and wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of VIDEO_PRODUCTION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedWeddingEventTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Wedding Event",
      slug: "wedding-event",
      description: "Wedding planning, vendor coordination, ceremony readiness, and post-event tasks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Wedding Event",
        description:
          "Wedding planning, vendor coordination, ceremony readiness, and post-event tasks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for a Wedding Event Checklist",
      slug: "preparation-for-a-wedding-event-checklist",
      description:
        "A wedding event checklist covering planning, legal documents, venue, catering, media, attire, entertainment, guest experience, emergency prep, event start, and wrap-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for a Wedding Event Checklist",
        description:
          "A wedding event checklist covering planning, legal documents, venue, catering, media, attire, entertainment, guest experience, emergency prep, event start, and wrap-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of WEDDING_EVENT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedBusinessConferenceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Business Conference",
      slug: "business-conference",
      description:
        "Conference planning, speaker coordination, attendee management, event operations, and wrap-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Business Conference",
        description:
          "Conference planning, speaker coordination, attendee management, event operations, and wrap-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Organizing a Business Conference Checklist",
      slug: "organizing-a-business-conference-checklist",
      description:
        "A business conference checklist covering planning, venue logistics, speakers, registration, marketing, technology, hospitality, staffing, live operations, and post-event review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Organizing a Business Conference Checklist",
        description:
          "A business conference checklist covering planning, venue logistics, speakers, registration, marketing, technology, hospitality, staffing, live operations, and post-event review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of BUSINESS_CONFERENCE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedWorkshopTrainingEventTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Workshop / Training Event",
      slug: "workshop-training-event",
      description:
        "Workshop planning, trainer coordination, participant management, delivery, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Workshop / Training Event",
        description:
          "Workshop planning, trainer coordination, participant management, delivery, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Organizing a Workshop / Training Event Checklist",
      slug: "organizing-a-workshop-training-event-checklist",
      description:
        "A workshop and training event checklist covering planning, logistics, materials, trainers, registration, technology, hospitality, live delivery, and post-event follow-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Organizing a Workshop / Training Event Checklist",
        description:
          "A workshop and training event checklist covering planning, logistics, materials, trainers, registration, technology, hospitality, live delivery, and post-event follow-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of WORKSHOP_TRAINING_EVENT_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOnlineWebinarTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Events",
      slug: "events",
      description: "Checklist templates for planning, coordinating, and running events.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Events",
        description: "Checklist templates for planning, coordinating, and running events.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Online Webinar",
      slug: "online-webinar",
      description: "Webinar planning, platform setup, presenter prep, delivery, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Online Webinar",
        description: "Webinar planning, platform setup, presenter prep, delivery, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparation for an Online Webinar Checklist",
      slug: "preparation-for-an-online-webinar-checklist",
      description:
        "An online webinar checklist covering planning, platform setup, presenter preparation, technical checks, marketing, webinar content, live moderation, and post-webinar follow-up.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparation for an Online Webinar Checklist",
        description:
          "An online webinar checklist covering planning, platform setup, presenter preparation, technical checks, marketing, webinar content, live moderation, and post-webinar follow-up.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of ONLINE_WEBINAR_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOfficeLaunchTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Business Operations",
      slug: "business-operations",
      description: "Checklist templates for workplace setup, operations, and business workflows.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Business Operations",
        description: "Checklist templates for workplace setup, operations, and business workflows.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Office Launch",
      slug: "office-launch",
      description:
        "Office launch planning, infrastructure, employee readiness, operations, safety, launch day, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Office Launch",
        description:
          "Office launch planning, infrastructure, employee readiness, operations, safety, launch day, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Launching a New Office Checklist",
      slug: "launching-a-new-office-checklist",
      description:
        "A new office launch checklist covering planning, office infrastructure, furniture, IT setup, employee readiness, administration, safety, opening day, and post-launch review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Launching a New Office Checklist",
        description:
          "A new office launch checklist covering planning, office infrastructure, furniture, IT setup, employee readiness, administration, safety, opening day, and post-launch review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of OFFICE_LAUNCH_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedMovingNewHomeTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Home and Moving",
      slug: "home-and-moving",
      description: "Checklist templates for moving, home setup, and household routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Home and Moving",
        description: "Checklist templates for moving, home setup, and household routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Moving Into a New Home",
      slug: "moving-into-a-new-home",
      description:
        "Moving planning, address updates, packing, utilities, move-in setup, safety, and settling in.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Moving Into a New Home",
        description:
          "Moving planning, address updates, packing, utilities, move-in setup, safety, and settling in.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Moving Into a New Home Checklist",
      slug: "moving-into-a-new-home-checklist",
      description:
        "A new-home moving checklist covering planning, administrative updates, packing, utilities, moving day, arrival, cleaning, safety, and post-move setup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Moving Into a New Home Checklist",
        description:
          "A new-home moving checklist covering planning, administrative updates, packing, utilities, moving day, arrival, cleaning, safety, and post-move setup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of MOVING_NEW_HOME_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedRentalPropertyInspectionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Property Management",
      slug: "property-management",
      description: "Checklist templates for rental properties, inspections, and property operations.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Property Management",
        description:
          "Checklist templates for rental properties, inspections, and property operations.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Pre-Rental Property Inspection",
      slug: "pre-rental-property-inspection",
      description:
        "Property documentation, exterior, interior, utilities, safety, cleaning, and final rental-readiness checks.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Pre-Rental Property Inspection",
        description:
          "Property documentation, exterior, interior, utilities, safety, cleaning, and final rental-readiness checks.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Inspection Before Renting Out a Property Checklist",
      slug: "inspection-before-renting-out-a-property-checklist",
      description:
        "A pre-rental property inspection checklist covering documents, exterior and interior condition, electrical, plumbing, kitchen, bathroom, HVAC, safety, cleaning, and final review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Inspection Before Renting Out a Property Checklist",
        description:
          "A pre-rental property inspection checklist covering documents, exterior and interior condition, electrical, plumbing, kitchen, bathroom, HVAC, safety, cleaning, and final review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of RENTAL_PROPERTY_INSPECTION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedAirbnbGuestPreparationTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Property Management",
      slug: "property-management",
      description: "Checklist templates for rental properties, inspections, and property operations.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Property Management",
        description:
          "Checklist templates for rental properties, inspections, and property operations.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Airbnb Guest Preparation",
      slug: "airbnb-guest-preparation",
      description:
        "Short-term rental guest communication, cleaning, setup, safety, guest support, and turnover.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Airbnb Guest Preparation",
        description:
          "Short-term rental guest communication, cleaning, setup, safety, guest support, and turnover.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for an Airbnb Guest Checklist",
      slug: "preparing-for-an-airbnb-guest-checklist",
      description:
        "An Airbnb guest preparation checklist covering communication, cleaning, bedroom, bathroom, kitchen, safety, guest experience, arrival, stay support, and checkout turnover.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for an Airbnb Guest Checklist",
        description:
          "An Airbnb guest preparation checklist covering communication, cleaning, bedroom, bathroom, kitchen, safety, guest experience, arrival, stay support, and checkout turnover.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of AIRBNB_GUEST_PREPARATION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedCarServiceTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      description: "Checklist templates for vehicle service, inspection, and travel readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Vehicle Maintenance",
        description: "Checklist templates for vehicle service, inspection, and travel readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Car Service",
      slug: "car-service",
      description:
        "Vehicle service planning, inspection, documentation, maintenance requests, service center visit, and follow-up.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Car Service",
        description:
          "Vehicle service planning, inspection, documentation, maintenance requests, service center visit, and follow-up.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Car Service Checklist",
      slug: "preparing-for-a-car-service-checklist",
      description:
        "A car service checklist covering appointment planning, vehicle inspection, documents, cleaning, maintenance requests, technology, service center communication, and post-service review.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Car Service Checklist",
        description:
          "A car service checklist covering appointment planning, vehicle inspection, documents, cleaning, maintenance requests, technology, service center communication, and post-service review.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of CAR_SERVICE_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedPreTripCarInspectionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      description: "Checklist templates for vehicle service, inspection, and travel readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Vehicle Maintenance",
        description: "Checklist templates for vehicle service, inspection, and travel readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Pre-Trip Car Inspection",
      slug: "pre-trip-car-inspection",
      description:
        "Technical vehicle checks before a road trip, including fluids, tires, brakes, lights, safety gear, documents, and in-trip monitoring.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Pre-Trip Car Inspection",
        description:
          "Technical vehicle checks before a road trip, including fluids, tires, brakes, lights, safety gear, documents, and in-trip monitoring.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Pre-Trip Technical Inspection of a Car Checklist",
      slug: "pre-trip-technical-inspection-of-a-car-checklist",
      description:
        "A pre-trip technical car inspection checklist covering engine fluids, tires, brakes, electrical systems, visibility, safety equipment, documents, departure checks, and in-trip monitoring.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Pre-Trip Technical Inspection of a Car Checklist",
        description:
          "A pre-trip technical car inspection checklist covering engine fluids, tires, brakes, electrical systems, visibility, safety equipment, documents, departure checks, and in-trip monitoring.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of PRE_TRIP_CAR_INSPECTION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedOffRoadExpeditionTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Vehicle Maintenance",
      slug: "vehicle-maintenance",
      description: "Checklist templates for vehicle service, inspection, and travel readiness.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Vehicle Maintenance",
        description: "Checklist templates for vehicle service, inspection, and travel readiness.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Off-Road Expedition",
      slug: "off-road-expedition",
      description:
        "Off-road route planning, vehicle preparation, recovery gear, navigation, survival supplies, expedition safety, and post-trip maintenance.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Off-Road Expedition",
        description:
          "Off-road route planning, vehicle preparation, recovery gear, navigation, survival supplies, expedition safety, and post-trip maintenance.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for an Off-Road Expedition Checklist",
      slug: "preparing-for-an-off-road-expedition-checklist",
      description:
        "An off-road expedition checklist covering route planning, vehicle prep, recovery equipment, navigation, camping supplies, safety, personal gear, departure, trip monitoring, and post-trip care.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for an Off-Road Expedition Checklist",
        description:
          "An off-road expedition checklist covering route planning, vehicle prep, recovery equipment, navigation, camping supplies, safety, personal gear, departure, trip monitoring, and post-trip care.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of OFF_ROAD_EXPEDITION_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function seedFishingTripTemplate() {
  const admin = await findOrCreateSystemAdmin();

  const [category] = await db
    .insert(categories)
    .values({
      name: "Outdoor Recreation",
      slug: "outdoor-recreation",
      description: "Checklist templates for camping, hiking, and outdoor safety routines.",
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: "Outdoor Recreation",
        description: "Checklist templates for camping, hiking, and outdoor safety routines.",
      },
    })
    .returning();

  const [activity] = await db
    .insert(activities)
    .values({
      categoryId: category.id,
      name: "Fishing Trip",
      slug: "fishing-trip",
      description:
        "Fishing trip planning, gear, water safety, personal supplies, navigation, emergency prep, and cleanup.",
    })
    .onConflictDoUpdate({
      target: activities.slug,
      set: {
        categoryId: category.id,
        name: "Fishing Trip",
        description:
          "Fishing trip planning, gear, water safety, personal supplies, navigation, emergency prep, and cleanup.",
      },
    })
    .returning();

  const [template] = await db
    .insert(checklistTemplates)
    .values({
      categoryId: category.id,
      activityId: activity.id,
      title: "Preparing for a Fishing Trip Checklist",
      slug: "preparing-for-a-fishing-trip-checklist",
      description:
        "A fishing trip checklist covering planning, fishing gear, boat safety, clothing, food, navigation, emergency supplies, departure, trip conduct, and post-trip cleanup.",
      status: "published",
      versionNumber: 1,
      createdByUserId: admin.id,
      updatedByUserId: admin.id,
    })
    .onConflictDoUpdate({
      target: checklistTemplates.slug,
      set: {
        categoryId: category.id,
        activityId: activity.id,
        title: "Preparing for a Fishing Trip Checklist",
        description:
          "A fishing trip checklist covering planning, fishing gear, boat safety, clothing, food, navigation, emergency supplies, departure, trip conduct, and post-trip cleanup.",
        status: "published",
        versionNumber: 1,
        updatedByUserId: admin.id,
      },
    })
    .returning();

  for (const [sectionIndex, sectionData] of FISHING_TRIP_CHECKLIST.entries()) {
    const [section] = await db
      .insert(templateSections)
      .values({
        templateId: template.id,
        title: sectionData.title,
        sortOrder: sectionIndex,
      })
      .returning();

    await db.insert(templateItems).values(
      sectionData.items.map((text, itemIndex) => ({
        sectionId: section.id,
        text,
        isRequired: false,
        sortOrder: itemIndex,
      })),
    );
  }

  return template;
}

async function main() {
  await seedSampleUsers();

  const existingScubaTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "scuba-diving-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingScubaTemplate && existingScubaTemplate.sections.length > 0) {
    console.log("Scuba diving preparation checklist seed already exists.");
  } else {
    const template = await seedScubaDivingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingDroneTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "drone-operator-pre-flight-preparation-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingDroneTemplate && existingDroneTemplate.sections.length > 0) {
    console.log("Drone pre-flight preparation checklist seed already exists.");
  } else {
    const template = await seedDronePreflightTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingTravelTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-international-travel-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingTravelTemplate && existingTravelTemplate.sections.length > 0) {
    console.log("International travel preparation checklist seed already exists.");
  } else {
    const template = await seedInternationalTravelTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingCampingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "camping-and-hiking-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingCampingTemplate && existingCampingTemplate.sections.length > 0) {
    console.log("Camping and hiking checklist seed already exists.");
  } else {
    const template = await seedCampingHikingTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingTentCampingTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "organizing-a-camping-trip-with-a-tent-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingTentCampingTemplate && existingTentCampingTemplate.sections.length > 0) {
    console.log("Tent camping trip checklist seed already exists.");
  } else {
    const template = await seedTentCampingTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingRoadTripTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-a-road-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingRoadTripTemplate && existingRoadTripTemplate.sections.length > 0) {
    console.log("Road trip preparation checklist seed already exists.");
  } else {
    const template = await seedRoadTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingPhotoShootTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-a-photo-shoot-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingPhotoShootTemplate && existingPhotoShootTemplate.sections.length > 0) {
    console.log("Photo shoot preparation checklist seed already exists.");
  } else {
    const template = await seedPhotoShootTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingVideoProductionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-video-production-filming-day-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingVideoProductionTemplate && existingVideoProductionTemplate.sections.length > 0) {
    console.log("Video production preparation checklist seed already exists.");
  } else {
    const template = await seedVideoProductionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingWeddingEventTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-a-wedding-event-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingWeddingEventTemplate && existingWeddingEventTemplate.sections.length > 0) {
    console.log("Wedding event preparation checklist seed already exists.");
  } else {
    const template = await seedWeddingEventTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingBusinessConferenceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "organizing-a-business-conference-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingBusinessConferenceTemplate && existingBusinessConferenceTemplate.sections.length > 0) {
    console.log("Business conference checklist seed already exists.");
  } else {
    const template = await seedBusinessConferenceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingWorkshopTrainingEventTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "organizing-a-workshop-training-event-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingWorkshopTrainingEventTemplate &&
    existingWorkshopTrainingEventTemplate.sections.length > 0
  ) {
    console.log("Workshop/training event checklist seed already exists.");
  } else {
    const template = await seedWorkshopTrainingEventTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOnlineWebinarTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparation-for-an-online-webinar-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingOnlineWebinarTemplate && existingOnlineWebinarTemplate.sections.length > 0) {
    console.log("Online webinar preparation checklist seed already exists.");
  } else {
    const template = await seedOnlineWebinarTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOfficeLaunchTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "launching-a-new-office-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingOfficeLaunchTemplate && existingOfficeLaunchTemplate.sections.length > 0) {
    console.log("Office launch checklist seed already exists.");
  } else {
    const template = await seedOfficeLaunchTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingMovingNewHomeTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "moving-into-a-new-home-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingMovingNewHomeTemplate && existingMovingNewHomeTemplate.sections.length > 0) {
    console.log("Moving into a new home checklist seed already exists.");
  } else {
    const template = await seedMovingNewHomeTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingRentalPropertyInspectionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "inspection-before-renting-out-a-property-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingRentalPropertyInspectionTemplate &&
    existingRentalPropertyInspectionTemplate.sections.length > 0
  ) {
    console.log("Pre-rental property inspection checklist seed already exists.");
  } else {
    const template = await seedRentalPropertyInspectionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingAirbnbGuestPreparationTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-an-airbnb-guest-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingAirbnbGuestPreparationTemplate &&
    existingAirbnbGuestPreparationTemplate.sections.length > 0
  ) {
    console.log("Airbnb guest preparation checklist seed already exists.");
  } else {
    const template = await seedAirbnbGuestPreparationTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingCarServiceTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-car-service-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingCarServiceTemplate && existingCarServiceTemplate.sections.length > 0) {
    console.log("Car service preparation checklist seed already exists.");
  } else {
    const template = await seedCarServiceTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingPreTripCarInspectionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "pre-trip-technical-inspection-of-a-car-checklist"),
    with: {
      sections: true,
    },
  });

  if (
    existingPreTripCarInspectionTemplate &&
    existingPreTripCarInspectionTemplate.sections.length > 0
  ) {
    console.log("Pre-trip technical car inspection checklist seed already exists.");
  } else {
    const template = await seedPreTripCarInspectionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingOffRoadExpeditionTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-an-off-road-expedition-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingOffRoadExpeditionTemplate && existingOffRoadExpeditionTemplate.sections.length > 0) {
    console.log("Off-road expedition preparation checklist seed already exists.");
  } else {
    const template = await seedOffRoadExpeditionTemplate();
    console.log(`Seeded template: ${template.title}`);
  }

  const existingFishingTripTemplate = await db.query.checklistTemplates.findFirst({
    where: eq(checklistTemplates.slug, "preparing-for-a-fishing-trip-checklist"),
    with: {
      sections: true,
    },
  });

  if (existingFishingTripTemplate && existingFishingTripTemplate.sections.length > 0) {
    console.log("Fishing trip preparation checklist seed already exists.");
  } else {
    const template = await seedFishingTripTemplate();
    console.log(`Seeded template: ${template.title}`);
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
