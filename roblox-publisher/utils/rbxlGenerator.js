// utils/rbxlGenerator.js
// Génère un fichier .rbxlx (XML) à partir des objets créés par le joueur

function escapeXml(str) {
  if (typeof str !== "string") str = String(str);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generatePart(obj, index) {
  const name = escapeXml(obj.name || `Part${index}`);
  const x = parseFloat(obj.x) || 0;
  const y = parseFloat(obj.y) || 0;
  const z = parseFloat(obj.z) || 0;
  const sx = parseFloat(obj.sizeX) || 4;
  const sy = parseFloat(obj.sizeY) || 1;
  const sz = parseFloat(obj.sizeZ) || 2;
  const r = parseInt(obj.colorR) || 163;
  const g = parseInt(obj.colorG) || 162;
  const b = parseInt(obj.colorB) || 165;
  const material = escapeXml(obj.material || "SmoothPlastic");
  const anchored = obj.anchored !== false ? "true" : "false";
  const shape = escapeXml(obj.shape || "Block");

  return `
    <Item class="Part" referent="RBX${index}">
      <Properties>
        <string name="Name">${name}</string>
        <bool name="Anchored">${anchored}</bool>
        <token name="Shape">${shape === "Ball" ? "1" : shape === "Cylinder" ? "3" : "0"}</token>
        <CoordinateFrame name="CFrame">
          <X>${x}</X>
          <Y>${y}</Y>
          <Z>${z}</Z>
          <R00>1</R00><R01>0</R01><R02>0</R02>
          <R10>0</R10><R11>1</R11><R12>0</R12>
          <R20>0</R20><R21>0</R21><R22>1</R22>
        </CoordinateFrame>
        <Vector3 name="Size">
          <X>${sx}</X>
          <Y>${sy}</Y>
          <Z>${sz}</Z>
        </Vector3>
        <Color3uint8 name="Color3">
          <R>${r}</R>
          <G>${g}</G>
          <B>${b}</B>
        </Color3uint8>
        <token name="Material">${getMaterialToken(material)}</token>
        <float name="Transparency">0</float>
        <bool name="CanCollide">true</bool>
        <bool name="CastShadow">true</bool>
      </Properties>
    </Item>`;
}

function getMaterialToken(material) {
  const materials = {
    "SmoothPlastic": "0", "Plastic": "256", "Wood": "512",
    "Marble": "768", "Granite": "1024", "Brick": "1280",
    "Cobblestone": "1536", "Concrete": "1792", "Metal": "1280",
    "DiamondPlate": "1344", "Foil": "1408", "Grass": "1472",
    "Ice": "1536", "Neon": "1600", "WoodPlanks": "1344",
    "Sand": "1616", "Fabric": "1632", "SandWet": "1648"
  };
  return materials[material] || "0";
}

function generateSpawnLocation() {
  return `
    <Item class="SpawnLocation" referent="RBXSPAWN">
      <Properties>
        <string name="Name">SpawnLocation</string>
        <bool name="Anchored">true</bool>
        <CoordinateFrame name="CFrame">
          <X>0</X><Y>0.5</Y><Z>0</Z>
          <R00>1</R00><R01>0</R01><R02>0</R02>
          <R10>0</R10><R11>1</R11><R12>0</R12>
          <R20>0</R20><R21>0</R21><R22>1</R22>
        </CoordinateFrame>
        <Vector3 name="Size">
          <X>6</X><Y>1</Y><Z>6</Z>
        </Vector3>
        <Color3uint8 name="Color3">
          <R>0</R><G>162</G><B>255</B>
        </Color3uint8>
        <float name="Duration">10</float>
        <bool name="TeamColor">false</bool>
        <bool name="AllowTeamChangeOnTouch">false</bool>
        <bool name="Enabled">true</bool>
      </Properties>
    </Item>`;
}

function generateBaseplate() {
  return `
    <Item class="Part" referent="RBXBASEPLATE">
      <Properties>
        <string name="Name">Baseplate</string>
        <bool name="Anchored">true</bool>
        <bool name="Locked">true</bool>
        <CoordinateFrame name="CFrame">
          <X>0</X><Y>-5</Y><Z>0</Z>
          <R00>1</R00><R01>0</R01><R02>0</R02>
          <R10>0</R10><R11>1</R11><R12>0</R12>
          <R20>0</R20><R21>0</R21><R22>1</R22>
        </CoordinateFrame>
        <Vector3 name="Size">
          <X>512</X><Y>10</Y><Z>512</Z>
        </Vector3>
        <Color3uint8 name="Color3">
          <R>106</R><G>127</G><B>63</B>
        </Color3uint8>
        <token name="Material">1472</token>
      </Properties>
    </Item>`;
}

function generateLighting(settings) {
  const ambient = settings?.ambient || { r: 70, g: 70, b: 70 };
  const brightness = settings?.brightness || 2;
  const timeOfDay = settings?.timeOfDay || "14:00:00";
  const fogEnd = settings?.fogEnd || 100000;

  return `
  <Item class="Lighting" referent="RBXLIGHTING">
    <Properties>
      <string name="Name">Lighting</string>
      <Color3uint8 name="Ambient">
        <R>${ambient.r}</R><G>${ambient.g}</G><B>${ambient.b}</B>
      </Color3uint8>
      <float name="Brightness">${brightness}</float>
      <string name="TimeOfDay">${timeOfDay}</string>
      <float name="FogEnd">${fogEnd}</float>
      <float name="FogStart">0</float>
      <bool name="GlobalShadows">true</bool>
    </Properties>
  </Item>`;
}

function generateScript(scriptData, index) {
  if (!scriptData || !scriptData.source) return "";
  const name = escapeXml(scriptData.name || `Script${index}`);
  const source = escapeXml(scriptData.source);
  const className = scriptData.type === "LocalScript" ? "LocalScript" : "Script";

  return `
    <Item class="${className}" referent="RBXSCRIPT${index}">
      <Properties>
        <string name="Name">${name}</string>
        <ProtectedString name="Source">${source}</ProtectedString>
        <bool name="Disabled">false</bool>
      </Properties>
    </Item>`;
}

function generateRbxlx(gameData) {
  const objects = gameData.objects || [];
  const scripts = gameData.scripts || [];
  const gameName = escapeXml(gameData.name || "Mon Jeu");
  const includeBaseplate = gameData.includeBaseplate !== false;

  const partsXml = objects.map((obj, i) => generatePart(obj, i)).join("\n");
  const scriptsXml = scripts.map((s, i) => generateScript(s, i)).join("\n");
  const baseplateXml = includeBaseplate ? generateBaseplate() : "";
  const lightingXml = generateLighting(gameData.lighting);

  return `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
  <Meta name="ExplicitAutoJoints">true</Meta>
  <External>null</External>
  <External>nil</External>
  <Item class="DataModel" referent="RBXROOT">
    <Properties>
      <string name="Name">${gameName}</string>
    </Properties>
    <Item class="Workspace" referent="RBXWORKSPACE">
      <Properties>
        <string name="Name">Workspace</string>
        <bool name="StreamingEnabled">false</bool>
        <float name="Gravity">196.2</float>
      </Properties>
      ${baseplateXml}
      ${generateSpawnLocation()}
      ${partsXml}
      ${scriptsXml}
    </Item>
    ${lightingXml}
    <Item class="ReplicatedStorage" referent="RBXREPLICATED">
      <Properties>
        <string name="Name">ReplicatedStorage</string>
      </Properties>
    </Item>
    <Item class="StarterGui" referent="RBXSTARTERGUI">
      <Properties>
        <string name="Name">StarterGui</string>
        <bool name="ResetPlayerGuiOnSpawn">true</bool>
      </Properties>
    </Item>
    <Item class="StarterPack" referent="RBXSTARTERPACK">
      <Properties>
        <string name="Name">StarterPack</string>
      </Properties>
    </Item>
    <Item class="Players" referent="RBXPLAYERS">
      <Properties>
        <string name="Name">Players</string>
        <bool name="CharacterAutoLoads">true</bool>
      </Properties>
    </Item>
    <Item class="SoundService" referent="RBXSOUND">
      <Properties>
        <string name="Name">SoundService</string>
      </Properties>
    </Item>
  </Item>
</roblox>`;
}

module.exports = { generateRbxlx };
