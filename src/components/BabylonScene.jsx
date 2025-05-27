import React, { useEffect, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import Wall from "./../assets/white.jpeg"

const BabylonScene = ({ width, height, depth }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const engineRef = useRef(null);

  const selectedModelRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    // Prevent scrolling/zooming the page when zooming inside canvas
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
    }, { passive: false });

    const createScene = async () => {
      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;

      const center = new BABYLON.Vector3(0,1, 0); // Center of the room + 2nd Parameter is for adjusting

      const camera = new BABYLON.ArcRotateCamera(
        "Camera",
        Math.PI / 2,          // alpha (horizontal rotation)
        Math.PI / 2.2,        // beta (vertical tilt)
        Math.min(width, depth) * 0.4, // SMALLER radius = more zoomed-in
        center,               // Target inside the room
        scene
      );

      camera.lowerRadiusLimit = 1;  // Allow user to zoom in more
      camera.upperRadiusLimit = Math.max(width, depth) * 2;
      camera.attachControl(canvasRef.current, true);

      camera.attachControl(canvasRef.current, true);

      new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

      const light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 0.8; // Adjust as needed

      // Floor  
      const floor = BABYLON.MeshBuilder.CreatePlane("ground", { width, height: depth }, scene);

      floor.rotation.x = Math.PI / 2;
      floor.isPickable = true;

      const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
      const tileTexture = new BABYLON.Texture(Wall, scene);
      tileTexture.uScale = 5;
      tileTexture.vScale = 5;
      floorMat.diffuseTexture = tileTexture;
      floorMat.backFaceCulling = false;
      floor.material = floorMat;

      const ceiling = BABYLON.MeshBuilder.CreatePlane("ceiling", { width, height: depth }, scene);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = height;

      // Ceiling Material
      const ceilingMat = new BABYLON.StandardMaterial("ceilingMat", scene);
      const ceilingTexture = new BABYLON.Texture(Wall, scene);
      ceilingTexture.uScale = 5;
      ceilingTexture.vScale = 5;
      ceilingMat.diffuseTexture = ceilingTexture;
      ceilingMat.backFaceCulling = false;
      ceiling.material = ceilingMat;

      // Wall Material
      const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
      const wallTexture = new BABYLON.Texture(Wall, scene);
      wallTexture.uScale = 1;
      wallTexture.vScale = 1;
      wallMat.diffuseTexture = wallTexture;
      wallMat.backFaceCulling = false;

      const wallA = BABYLON.MeshBuilder.CreatePlane("wallA", { width, height }, scene);
      wallA.position = new BABYLON.Vector3(0, height / 2, -depth / 2);
      wallA.rotation.y = Math.PI;
      wallA.material = wallMat;

      const wallB = BABYLON.MeshBuilder.CreatePlane("wallB", { width, height }, scene);
      wallB.position = new BABYLON.Vector3(0, height / 2, depth / 2);
      wallB.material = wallMat;

      const wallC = BABYLON.MeshBuilder.CreatePlane("wallC", { width: depth, height }, scene);
      wallC.position = new BABYLON.Vector3(-width / 2, height / 2, 0);
      wallC.rotation.y = Math.PI / 2;
      wallC.material = wallMat;

      const wallD = BABYLON.MeshBuilder.CreatePlane("wallD", { width: depth, height }, scene);
      wallD.position = new BABYLON.Vector3(width / 2, height / 2, 0);
      wallD.rotation.y = -Math.PI / 2;
      wallD.material = wallMat;

      scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
        if (pickedMesh && pickedMesh.parent) {
          selectedModelRef.current = pickedMesh.parent;
        } else {
          selectedModelRef.current = null;
        }
      }
    });

      return scene;
    };

    createScene().then(scene => {
      engine.runRenderLoop(() => scene.render());
      window.addEventListener("resize", () => engine.resize());
    });

   const handleKeyDown = (e) => {
    const model = selectedModelRef.current;
    if (!model) return;

    // Check if model is still alive in the scene
    if (model.isDisposed() || !model.getScene()) {
      selectedModelRef.current = null;
      return;
    }

    const scaleStep = 0.1;
    const currentScale = model.scaling.clone();

    if (e.key === '+' || e.key === '=') {
      model.scaling = currentScale.add(new BABYLON.Vector3(scaleStep, scaleStep, scaleStep));
    } else if (e.key === '-' || e.code === 'NumpadSubtract') {
      const newScale = currentScale.subtract(new BABYLON.Vector3(scaleStep, scaleStep, scaleStep));
      if (newScale.x > 0.1 && newScale.y > 0.1 && newScale.z > 0.1) {
        model.scaling = newScale;
      }
    } else if (e.key.toLowerCase() === 'r') {
      model.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(15), BABYLON.Space.LOCAL);
    } else if (e.key === "Delete" || e.key === "Escape") {
      model.dispose();
      selectedModelRef.current = null;
    }
  };

  window.addEventListener("keydown", handleKeyDown);

    return () => {
      engine.dispose();
      window.removeEventListener("keydown", handleKeyDown);
    };  

  }, [width, height, depth]);

  const getGroundIntersection = (scene, pointerX, pointerY) => {
  const ray = scene.createPickingRay(pointerX, pointerY, BABYLON.Matrix.Identity(), scene.activeCamera);
  const ground = scene.getMeshByName("ground");
  if (!ground) return null;

    const intersect = ray.intersectsMesh(ground, false);
      if (intersect.hit) return intersect.pickedPoint;

      return null;
    };

    const handleDrop = async (e) => {
    e.preventDefault();
    const modelUrl = e.dataTransfer.getData("furnitureUrl");
    if (!modelUrl || !sceneRef.current) return;

    const scene = sceneRef.current;

    await new Promise(requestAnimationFrame);

    const position = getGroundIntersection(scene, scene.pointerX, scene.pointerY);
    if (!position) return;

    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync("", modelUrl, "", scene, undefined, ".glb");
      const modelRoot = new BABYLON.TransformNode("modelRoot", scene);

      result.meshes.forEach(mesh => {
        if (mesh !== result.meshes[0]) { // Skip root dummy
          mesh.parent = modelRoot;
        }
      });

      const boundingInfo = result.meshes[0].getBoundingInfo();
      const minY = boundingInfo.boundingBox.minimumWorld.y;
      const deltaY = minY - position.y;

      modelRoot.position = new BABYLON.Vector3(position.x, position.y - deltaY, position.z);

      // 👉 Add drag behavior
      const dragBehavior = new BABYLON.PointerDragBehavior({ dragPlaneNormal: new BABYLON.Vector3(0, 1, 0) });
      dragBehavior.useObjectOrientationForDragging = false;
      dragBehavior.updateDragPlane = false;

      modelRoot.addBehavior(dragBehavior);
    } catch (error) {
      console.error("Failed to load model:", error);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    />
  );
};

export default BabylonScene;



