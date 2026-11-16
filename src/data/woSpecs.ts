import type { Priority } from '../types';

export interface WoSpec {
  title: string;
  category: string;
  type: string;
  recurrence: string;
  duration: string;
  priority: Priority;
  /** Asset catalog types this work order is performed on. */
  assetTypes: string[];
  description: string;
  /** A task ending in [unit] asks for a reading in the checklist. */
  tasks: string[];
  supplier: string;
  /** Only generated for this building (short name). */
  only?: string;
}

/** Work order templates. French titles get French content. */
export const WO_SPECS: WoSpec[] = [
  {
    "title": "Toit des Studios",
    "category": "Roofing",
    "type": "Solar",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "High",
    "assetTypes": [
      "Solar panel",
      "Solar inverter"
    ],
    "description": "Inspection annuelle de l’installation solaire sur le toit des studios, avant l’hiver.",
    "tasks": [
      "Inspecter les fixations et les rails",
      "Vérifier l’absence de fissures sur les modules",
      "Nettoyer la surface des panneaux",
      "Contrôler le serrage des connecteurs",
      "Relever la température des panneaux [°C]"
    ],
    "supplier": "Toitures Mont-Royal",
    "only": "Radio-Canada"
  },
  {
    "title": "Inspection annuelle des extincteurs",
    "category": "Fire safety",
    "type": "Extinguishers",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "Medium",
    "assetTypes": [
      "Extinguisher"
    ],
    "description": "Inspection réglementaire de tous les extincteurs portatifs de l’aile, selon la norme NFPA 10.",
    "tasks": [
      "Vérifier la pression au manomètre",
      "Inspecter la goupille et le scellé",
      "Contrôler la date d’essai hydrostatique",
      "Apposer l’étiquette d’inspection 2022"
    ],
    "supplier": "Vigil Sécurité Incendie"
  },
  {
    "title": "Replace AHU filters",
    "category": "HVAC",
    "type": "Filtration",
    "recurrence": "Every 3 months",
    "duration": "4 hours",
    "priority": "Medium",
    "assetTypes": [
      "Air handling unit"
    ],
    "description": "Quarterly filter change on the air handling unit, which serves the studios on floors 2 to 4.",
    "tasks": [
      "Lock out the air handling unit and tag the disconnect",
      "Record pressure drop across the filter bank [Pa]",
      "Remove and bag the old pre-filters and bag filters",
      "Install new MERV 13 filters and check the seals",
      "Restart the unit and record the new pressure drop [Pa]"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Nettoyage des conduits de ventilation",
    "category": "HVAC",
    "type": "Ductwork",
    "recurrence": "Annual",
    "duration": "2 days",
    "priority": "Low",
    "assetTypes": [
      "Air handling unit",
      "Exhaust fan"
    ],
    "description": "Nettoyage complet du réseau de conduits de l’unité de traitement d’air, à faire de nuit pour ne pas déranger les enregistrements.",
    "tasks": [
      "Protéger les plafonds et le mobilier",
      "Ouvrir les trappes d’accès",
      "Brosser et aspirer les conduits principaux",
      "Photographier avant et après",
      "Refermer et sceller les trappes"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Backflow preventer annual test",
    "category": "Plumbing",
    "type": "Backflow prevention",
    "recurrence": "Annual",
    "duration": "2 hours",
    "priority": "High",
    "assetTypes": [
      "Backflow preventer"
    ],
    "description": "Annual test required by the City of Montréal. The signed form must be sent within 30 days.",
    "tasks": [
      "Notify occupants of the water shut-off",
      "Test differential pressure on check valves 1 and 2 [kPa]",
      "Record the relief valve opening point [kPa]",
      "Fill in the municipal test form",
      "Restore the water supply and check for leaks"
    ],
    "supplier": "Plomberie Saint-Laurent"
  },
  {
    "title": "Rooftop unit spring start-up",
    "category": "HVAC",
    "type": "Rooftop units",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "Medium",
    "assetTypes": [
      "Rooftop unit"
    ],
    "description": "Spring start-up of both rooftop units before cooling season.",
    "tasks": [
      "Remove the winter covers from the condensers",
      "Check belts and pulley alignment",
      "Measure refrigerant suction pressure [kPa]",
      "Record supply air temperature [°C]",
      "Verify economizer operation"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Elevator monthly inspection",
    "category": "Vertical transport",
    "type": "Elevators",
    "recurrence": "Monthly",
    "duration": "3 hours",
    "priority": "High",
    "assetTypes": [
      "Elevator"
    ],
    "description": "Monthly maintenance visit on the two passenger elevators in the main lobby.",
    "tasks": [
      "Test the emergency phone and alarm bell",
      "Check the door reopening device",
      "Inspect cab lighting and fan",
      "Verify levelling at each floor",
      "Sign the elevator logbook"
    ],
    "supplier": "Ascenseurs Montcalm"
  },
  {
    "title": "Essai de la génératrice d’urgence",
    "category": "Electrical",
    "type": "Emergency power",
    "recurrence": "Monthly",
    "duration": "2 hours",
    "priority": "High",
    "assetTypes": [
      "Generator",
      "Transfer switch"
    ],
    "description": "Essai mensuel sous charge de la génératrice qui alimente les régies de diffusion.",
    "tasks": [
      "Vérifier le niveau de carburant",
      "Démarrer la génératrice sous charge",
      "Relever la tension de sortie [V]",
      "Laisser tourner 30 minutes",
      "Consigner les résultats au registre"
    ],
    "supplier": "Shepard"
  },
  {
    "title": "Grease interceptor pumping",
    "category": "Plumbing",
    "type": "Grease interceptor",
    "recurrence": "Every 3 months",
    "duration": "3 hours",
    "priority": "Medium",
    "assetTypes": [
      "Grease interceptor"
    ],
    "description": "Quarterly pump-out of the kitchen grease interceptor, scheduled after the cafeteria closes.",
    "tasks": [
      "Ask the kitchen to stop dishwashing",
      "Measure the grease layer before pumping [cm]",
      "Pump out the interceptor",
      "Scrape the baffles and the inlet",
      "Keep the pump-out manifest for the city"
    ],
    "supplier": "Plomberie Saint-Laurent"
  },
  {
    "title": "Kitchen exhaust hood cleaning",
    "category": "Kitchen equipment",
    "type": "Exhaust hoods",
    "recurrence": "Bi-annual",
    "duration": "1 day",
    "priority": "High",
    "assetTypes": [
      "Range hood",
      "Exhaust fan"
    ],
    "description": "Bi-annual hood and duct degreasing required by the fire code. Overnight job, kitchen closed.",
    "tasks": [
      "Cover the cooking equipment",
      "Remove and degrease the filters",
      "Scrape the plenum and the duct",
      "Clean the rooftop exhaust fan",
      "Apply the cleaning certificate sticker"
    ],
    "supplier": "Entretien Lumina"
  },
  {
    "title": "Boiler combustion analysis",
    "category": "HVAC",
    "type": "Boilers",
    "recurrence": "Annual",
    "duration": "4 hours",
    "priority": "Medium",
    "assetTypes": [
      "Boiler"
    ],
    "description": "Annual combustion tune-up on both heating boilers before the heating season peaks.",
    "tasks": [
      "Measure flue gas O2 [%]",
      "Record the stack temperature [°C]",
      "Adjust the burner air-fuel ratio",
      "Test the low-water cut-off",
      "Record efficiency in the report"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Cooling tower water treatment",
    "category": "HVAC",
    "type": "Cooling tower",
    "recurrence": "Monthly",
    "duration": "2 hours",
    "priority": "High",
    "assetTypes": [
      "Cooling tower"
    ],
    "description": "Monthly Legionella control required by the RBQ for cooling towers.",
    "tasks": [
      "Collect a water sample for Legionella analysis",
      "Check the biocide pump and drum level",
      "Measure conductivity [µS/cm]",
      "Inspect the drift eliminators",
      "Upload results to the RBQ register"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Emergency lighting test",
    "category": "Electrical",
    "type": "Emergency lighting",
    "recurrence": "Monthly",
    "duration": "3 hours",
    "priority": "Medium",
    "assetTypes": [
      "Emergency lighting"
    ],
    "description": "Monthly functional test of emergency lights and exit signs on every floor.",
    "tasks": [
      "Press the test button on each unit",
      "Run the 30-minute battery test",
      "Replace failed lamps",
      "Check that exit signs are lit",
      "Record results per floor"
    ],
    "supplier": "Shepard"
  },
  {
    "title": "Remplacement des courroies de l’extracteur",
    "category": "HVAC",
    "type": "Exhaust fans",
    "recurrence": "Annual",
    "duration": "2 hours",
    "priority": "Low",
    "assetTypes": [
      "Exhaust fan"
    ],
    "description": "Les courroies de l’extracteur sont usées et font du bruit dans le studio voisin.",
    "tasks": [
      "Cadenasser le ventilateur",
      "Retirer les courroies usées",
      "Installer les nouvelles courroies",
      "Ajuster la tension et l’alignement",
      "Remettre en marche et mesurer l’ampérage [A]"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Fire alarm panel verification",
    "category": "Fire safety",
    "type": "Fire alarm",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "High",
    "assetTypes": [
      "Fire alarm panel"
    ],
    "description": "Annual verification of the fire alarm system under CAN/ULC-S536.",
    "tasks": [
      "Notify the monitoring station",
      "Test each zone from the panel",
      "Measure battery voltage [V]",
      "Test pull stations on two floors",
      "Restore the panel to normal and notify the station"
    ],
    "supplier": "Vigil Sécurité Incendie"
  },
  {
    "title": "Calibrate BMS temperature sensors",
    "category": "Building automation",
    "type": "Sensors",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "Low",
    "assetTypes": [
      "Controller"
    ],
    "description": "Studio occupants report rooms feeling warmer than the BMS shows. Recalibrate the zone sensors.",
    "tasks": [
      "Export current readings from the BMS",
      "Compare each sensor with a reference thermometer",
      "Apply offsets above 0.5 °C",
      "Record the temperature in the studio [°C]",
      "Save the calibration log"
    ],
    "supplier": "Northline Controls"
  },
  {
    "title": "Déneigement de la toiture",
    "category": "Roofing",
    "type": "Snow removal",
    "recurrence": "Every 2 weeks",
    "duration": "4 hours",
    "priority": "High",
    "assetTypes": [
      "Roof drain",
      "Rooftop unit"
    ],
    "description": "Déneigement du toit après chaque accumulation de plus de 30 cm.",
    "tasks": [
      "Installer le périmètre de sécurité au sol",
      "Mesurer l’épaisseur de neige [cm]",
      "Dégager les drains et les unités de toiture",
      "Déneiger les accès et les issues",
      "Prendre des photos après"
    ],
    "supplier": "Toitures Mont-Royal"
  },
  {
    "title": "Check walk-in cooler door gaskets",
    "category": "Refrigeration",
    "type": "Walk-in cooler",
    "recurrence": "Monthly",
    "duration": "1 hour",
    "priority": "Medium",
    "assetTypes": [
      "Walk-in cooler"
    ],
    "description": "Kitchen staff noticed frost around the walk-in door. Check the gaskets and the door heater.",
    "tasks": [
      "Inspect the gasket for tears",
      "Do a paper test around the door",
      "Check the door heater strip",
      "Record the box temperature [°C]",
      "Clean the gasket with mild soap"
    ],
    "supplier": "Réfrigération Boréal"
  },
  {
    "title": "Inspection thermographique du panneau électrique",
    "category": "Electrical",
    "type": "Panelboards",
    "recurrence": "Annual",
    "duration": "4 hours",
    "priority": "Medium",
    "assetTypes": [
      "Panelboard"
    ],
    "description": "Thermographie annuelle exigée par l’assureur, sur les panneaux du rez-de-chaussée.",
    "tasks": [
      "Retirer les couvercles sous supervision",
      "Prendre les images thermiques sous charge",
      "Relever la température du point le plus chaud [°C]",
      "Identifier les connexions à resserrer",
      "Remettre le rapport thermographique"
    ],
    "supplier": "Shepard"
  },
  {
    "title": "Replace lobby LED fixtures",
    "category": "Electrical",
    "type": "Lighting",
    "recurrence": "One time",
    "duration": "1 day",
    "priority": "Low",
    "assetTypes": [
      "Lighting"
    ],
    "description": "Replace the remaining fluorescent fixtures in the lobby with dimmable LED fixtures.",
    "tasks": [
      "Set up scaffolding in the lobby",
      "Remove the old fixtures",
      "Install the new LED fixtures",
      "Test dimming with the lighting control",
      "Recycle the old fixtures"
    ],
    "supplier": "Shepard"
  },
  {
    "title": "Vérification des clapets coupe-feu",
    "category": "Fire safety",
    "type": "Fire dampers",
    "recurrence": "Annual",
    "duration": "2 days",
    "priority": "Medium",
    "assetTypes": [
      "Fire damper"
    ],
    "description": "Vérification des clapets coupe-feu selon NFPA 80, aile des studios.",
    "tasks": [
      "Localiser les clapets sur les plans",
      "Ouvrir les trappes d’accès",
      "Déclencher chaque clapet et vérifier la fermeture",
      "Réarmer le fusible",
      "Étiqueter et photographier chaque clapet"
    ],
    "supplier": "Vigil Sécurité Incendie"
  },
  {
    "title": "Descale commercial dishwasher",
    "category": "Kitchen equipment",
    "type": "Dishwasher",
    "recurrence": "Monthly",
    "duration": "2 hours",
    "priority": "Low",
    "assetTypes": [
      "Dishwasher"
    ],
    "description": "Monthly descaling. Montréal water leaves heavy scale on the rinse arms.",
    "tasks": [
      "Drain and cool the machine",
      "Run the descaling cycle",
      "Clean the wash and rinse arms",
      "Check the final rinse temperature [°C]",
      "Refill the chemicals"
    ],
    "supplier": "Réfrigération Boréal"
  },
  {
    "title": "Water heater anode inspection",
    "category": "Plumbing",
    "type": "Water heaters",
    "recurrence": "Annual",
    "duration": "3 hours",
    "priority": "Low",
    "assetTypes": [
      "Water heater"
    ],
    "description": "Annual anode check on the main domestic hot water heater.",
    "tasks": [
      "Shut off gas and cold water supply",
      "Drain a few litres from the tank",
      "Remove and inspect the anode rod",
      "Replace the anode if under 50% left",
      "Refill and check the outlet temperature [°C]"
    ],
    "supplier": "Plomberie Saint-Laurent"
  },
  {
    "title": "Test des détecteurs de fumée",
    "category": "Fire safety",
    "type": "Smoke detectors",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "High",
    "assetTypes": [
      "Smoke detector"
    ],
    "description": "Essai annuel de tous les détecteurs de fumée raccordés au panneau d’alarme.",
    "tasks": [
      "Aviser la centrale de surveillance",
      "Tester chaque détecteur avec un aérosol",
      "Vérifier le signal au panneau",
      "Remplacer les détecteurs défectueux",
      "Remettre le rapport d’essai"
    ],
    "supplier": "Vigil Sécurité Incendie"
  },
  {
    "title": "Repair leaking faucet",
    "category": "Plumbing",
    "type": "Fixtures",
    "recurrence": "One time",
    "duration": "1 hour",
    "priority": "Medium",
    "assetTypes": [
      "Faucet"
    ],
    "description": "Tenant request: the second faucet in a washroom drips constantly.",
    "tasks": [
      "Shut off the supply under the sink",
      "Replace the cartridge",
      "Check the aerator and clean it",
      "Test for leaks"
    ],
    "supplier": "Plomberie Saint-Laurent"
  },
  {
    "title": "Clean solar panels",
    "category": "Electrical",
    "type": "Solar",
    "recurrence": "Bi-annual",
    "duration": "4 hours",
    "priority": "Low",
    "assetTypes": [
      "Solar panel",
      "Solar inverter"
    ],
    "description": "Spring and fall cleaning of the rooftop panels. Output dropped by 6% since the last cleaning.",
    "tasks": [
      "Record inverter output before cleaning [kW]",
      "Rinse panels with deionized water",
      "Clean with a soft brush, no detergent",
      "Record inverter output after cleaning [kW]"
    ],
    "supplier": "Toitures Mont-Royal",
    "only": "Radio-Canada"
  },
  {
    "title": "Adjust VAV box airflow",
    "category": "HVAC",
    "type": "VAV boxes",
    "recurrence": "One time",
    "duration": "3 hours",
    "priority": "Medium",
    "assetTypes": [
      "VAV box"
    ],
    "description": "A studio is too cold during broadcasts. Rebalance the VAV box.",
    "tasks": [
      "Measure the current airflow [L/s]",
      "Check the damper actuator",
      "Adjust the minimum and maximum setpoints",
      "Measure the new airflow [L/s]",
      "Confirm comfort with the studio manager"
    ],
    "supplier": "Northline Controls"
  },
  {
    "title": "Inspection des gicleurs",
    "category": "Fire safety",
    "type": "Sprinklers",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "High",
    "assetTypes": [
      "Sprinkler valve"
    ],
    "description": "Inspection annuelle du réseau de gicleurs selon NFPA 25.",
    "tasks": [
      "Vérifier la position des vannes",
      "Relever la pression statique [kPa]",
      "Faire l’essai de débit principal",
      "Inspecter les têtes de gicleurs visibles",
      "Remplir le rapport d’inspection"
    ],
    "supplier": "Vigil Sécurité Incendie"
  },
  {
    "title": "Replace ice machine water filter",
    "category": "Refrigeration",
    "type": "Ice machine",
    "recurrence": "Bi-annual",
    "duration": "1 hour",
    "priority": "Low",
    "assetTypes": [
      "Ice machine"
    ],
    "description": "Six-month filter change on the cafeteria ice machine.",
    "tasks": [
      "Turn off the machine and the water supply",
      "Replace the filter cartridge",
      "Flush the new filter",
      "Sanitize the ice bin",
      "Discard the first batch of ice"
    ],
    "supplier": "Réfrigération Boréal"
  },
  {
    "title": "Lubrification des pompes de circulation",
    "category": "HVAC",
    "type": "Pumps",
    "recurrence": "Bi-annual",
    "duration": "3 hours",
    "priority": "Low",
    "assetTypes": [
      "Circulation pump"
    ],
    "description": "Graissage semestriel des pompes de chauffage dans la salle mécanique.",
    "tasks": [
      "Cadenasser chaque pompe",
      "Graisser les roulements",
      "Vérifier l’alignement de l’accouplement",
      "Mesurer les vibrations [mm/s]",
      "Remettre en service"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Roof drain inspection",
    "category": "Roofing",
    "type": "Drains",
    "recurrence": "Bi-annual",
    "duration": "2 hours",
    "priority": "Medium",
    "assetTypes": [
      "Roof drain"
    ],
    "description": "Spring and fall drain inspection to prevent ponding and leaks into the studios.",
    "tasks": [
      "Remove debris from the strainers",
      "Check the clamping rings",
      "Run water to confirm flow",
      "Look for ponding around the drain",
      "Take photos of each drain"
    ],
    "supplier": "Toitures Mont-Royal"
  },
  {
    "title": "Repaint loading dock lines",
    "category": "Exterior",
    "type": "Pavement",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "Low",
    "assetTypes": [
      "Loading dock"
    ],
    "description": "Repaint the faded safety lines and the truck bays at the loading dock.",
    "tasks": [
      "Block the dock for the day",
      "Clean and dry the surface",
      "Repaint the safety lines in yellow",
      "Repaint the bay numbers",
      "Reopen once dry"
    ],
    "supplier": "Entretien Lumina"
  },
  {
    "title": "Vérification de l’onduleur UPS",
    "category": "Electrical",
    "type": "UPS",
    "recurrence": "Bi-annual",
    "duration": "2 hours",
    "priority": "High",
    "assetTypes": [
      "UPS"
    ],
    "description": "Vérification semestrielle de l’onduleur qui protège les équipements de diffusion.",
    "tasks": [
      "Prévenir l’équipe technique de la diffusion",
      "Vérifier l’autonomie des batteries [min]",
      "Inspecter les ventilateurs",
      "Lire le journal d’événements",
      "Faire un essai de transfert sur batterie"
    ],
    "supplier": "Shepard"
  },
  {
    "title": "Update conference room firmware",
    "category": "Audio-visual",
    "type": "Video conferencing",
    "recurrence": "Bi-annual",
    "duration": "2 hours",
    "priority": "Low",
    "assetTypes": [
      "Video conferencing",
      "Display"
    ],
    "description": "Firmware update on the meeting room systems, after hours.",
    "tasks": [
      "Check that no meeting is booked",
      "Back up the current configuration",
      "Install the latest firmware",
      "Test a call and screen sharing",
      "Reset the room to default settings"
    ],
    "supplier": "Northline Controls"
  },
  {
    "title": "Pest control quarterly visit",
    "category": "Janitorial",
    "type": "Pest control",
    "recurrence": "Every 3 months",
    "duration": "2 hours",
    "priority": "Medium",
    "assetTypes": [],
    "description": "Quarterly preventive visit, focused on the kitchen and the loading dock.",
    "tasks": [
      "Inspect the bait stations",
      "Replace the glue boards",
      "Check door sweeps at the loading dock",
      "Note any activity on the site map",
      "Leave the visit report with security"
    ],
    "supplier": "Entretien Lumina"
  },
  {
    "title": "Remplacement des filtres de la hotte",
    "category": "Kitchen equipment",
    "type": "Exhaust hoods",
    "recurrence": "Monthly",
    "duration": "1 hour",
    "priority": "Medium",
    "assetTypes": [
      "Range hood"
    ],
    "description": "Remplacement mensuel des filtres à graisse de la hotte de la cafétéria.",
    "tasks": [
      "Éteindre l’équipement de cuisson",
      "Retirer les filtres encrassés",
      "Installer les filtres propres",
      "Vérifier le fonctionnement du ventilateur",
      "Envoyer les filtres sales au nettoyage"
    ],
    "supplier": "Entretien Lumina"
  },
  {
    "title": "Chiller seasonal shutdown",
    "category": "HVAC",
    "type": "Chiller",
    "recurrence": "Annual",
    "duration": "1 day",
    "priority": "Medium",
    "assetTypes": [
      "Chiller"
    ],
    "description": "Fall shutdown of the chiller and winterization of the condenser water loop.",
    "tasks": [
      "Record final operating pressures [kPa]",
      "Shut down the chiller and pumps",
      "Drain the condenser water loop",
      "Inspect the tubes for scale",
      "Lock out until spring"
    ],
    "supplier": "Mécanique Laurentide"
  },
  {
    "title": "Inspect parking garage CO sensors",
    "category": "Building automation",
    "type": "Gas detection",
    "recurrence": "Annual",
    "duration": "4 hours",
    "priority": "High",
    "assetTypes": [
      "Gas detection"
    ],
    "description": "Annual calibration of carbon monoxide sensors in the underground parking.",
    "tasks": [
      "Bump test each sensor with calibration gas",
      "Record the reading at 50 ppm [ppm]",
      "Check the exhaust fan starts on alarm",
      "Replace sensors past their service life",
      "Update the calibration labels"
    ],
    "supplier": "Northline Controls"
  },
  {
    "title": "Nettoyage des vitres extérieures",
    "category": "Janitorial",
    "type": "Windows",
    "recurrence": "Bi-annual",
    "duration": "2 days",
    "priority": "Low",
    "assetTypes": [],
    "description": "Lavage semestriel des vitres extérieures par nacelle.",
    "tasks": [
      "Réserver la zone de travail sur le trottoir",
      "Installer la nacelle",
      "Laver les vitres de la façade est",
      "Laver les vitres de la façade sud",
      "Retirer le périmètre de sécurité"
    ],
    "supplier": "Entretien Lumina"
  },
  {
    "title": "Replace worn door closer",
    "category": "Architectural",
    "type": "Doors",
    "recurrence": "One time",
    "duration": "2 hours",
    "priority": "Medium",
    "assetTypes": [
      "Door closer"
    ],
    "description": "The door at an entrance slams shut. Replace the closer.",
    "tasks": [
      "Remove the old closer",
      "Install the new closer",
      "Adjust the closing speed",
      "Check the latch engages",
      "Test the door with the access card reader"
    ],
    "supplier": "Entretien Lumina"
  },
  {
    "title": "Sweep snow",
    "category": "Roofing",
    "type": "Snow removal",
    "recurrence": "Every 2 weeks",
    "duration": "4 hours",
    "priority": "Medium",
    "assetTypes": [
      "Solar panel"
    ],
    "description": "Clear snow from the solar panels after each snowfall over 10 cm.",
    "tasks": [
      "Check roof access is safe",
      "Brush snow off with a soft roof rake",
      "Clear around the inverter",
      "Check the panels for damage"
    ],
    "supplier": "Toitures Mont-Royal",
    "only": "Radio-Canada"
  },
  {
    "title": "Adjust inclination",
    "category": "Electrical",
    "type": "Solar",
    "recurrence": "Bi-annual",
    "duration": "4 hours",
    "priority": "Low",
    "assetTypes": [
      "Solar panel"
    ],
    "description": "Seasonal tilt change for better winter output.",
    "tasks": [
      "Loosen the mounting brackets",
      "Set the tilt to the winter angle",
      "Tighten the brackets to torque",
      "Record inverter output after adjustment [kW]"
    ],
    "supplier": "Toitures Mont-Royal",
    "only": "Radio-Canada"
  }
];

export const FRENCH_TITLES = new Set<string>(["Toit des Studios","Inspection annuelle des extincteurs","Nettoyage des conduits de ventilation","Essai de la génératrice d’urgence","Remplacement des courroies de l’extracteur","Déneigement de la toiture","Inspection thermographique du panneau électrique","Vérification des clapets coupe-feu","Test des détecteurs de fumée","Inspection des gicleurs","Lubrification des pompes de circulation","Vérification de l’onduleur UPS","Remplacement des filtres de la hotte","Nettoyage des vitres extérieures"]);
