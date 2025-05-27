import React, { useEffect, useRef, useState } from "react";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import Wall from "./../assets/white.jpeg";
import { Maximize, Minimize } from "lucide-react";

const BabylonScene = ({ width, height, depth }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const sceneRef = useRef(null);
  const selectedModelRef = useRef(null);
  const containerRef = useRef(null);
  const cameraRef = useRef(null); // <-- Reference to camera

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    engineRef.current = engine;

    const createScene = async () => {
      const scene = new BABYLON.Scene(engine);
      sceneRef.current = scene;

      const center = new BABYLON.Vector3(0, 1, 0);
      const camera = new BABYLON.ArcRotateCamera(
        "Camera",
        Math.PI / 2,
        Math.PI / 2.2,
        Math.min(width, depth) * 0.4,
        center,
        scene
      );

      camera.lowerRadiusLimit = 1;
      camera.upperRadiusLimit = Math.max(width, depth) * 2;
      camera.attachControl(canvas, true);

      cameraRef.current = camera; // Save camera ref here

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

      // Pick mesh to select model
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

    createScene().then((scene) => {
      engine.runRenderLoop(() => {
        if (scene) scene.render();
      });

      const onResize = () => {
        engine.resize();
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        engine.dispose();
      };
    });

    // Prevent default scrolling on wheel inside canvas
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }, [width, height, depth]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.meshes.forEach((mesh) => {
      if (mesh.dragBehavior) {
        mesh.dragBehavior.enabled = !isFullscreen;
      }
    });

    if (engineRef.current) {
      setTimeout(() => engineRef.current.resize(), 100);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const model = selectedModelRef.current;
      const camera = cameraRef.current;
      if (!camera) return;

      const moveStep = 0.1;
      const scaleStep = 0.1;

      if (isFullscreen) {
        // Move the camera target with WASD keys
        // Moving target simulates user movement in scene
        switch (e.key.toLowerCase()) {
          case "w":
            camera.target.z -= moveStep;
            break;
          case "s":
            camera.target.z += moveStep;
            break;
          case "a":
            camera.target.x += moveStep;
            break;
          case "d":
            camera.target.x -= moveStep;
            break;
          default:
            break;
        }
      } else {
        // Manipulate selected model in normal mode
        if (!model || model.isDisposed() || !model.getScene()) {
          selectedModelRef.current = null;
          return;
        }

        if (e.key === "+" || e.key === "=") {
          model.scaling = model.scaling.add(new BABYLON.Vector3(scaleStep, scaleStep, scaleStep));
        } else if (e.key === "-" || e.code === "NumpadSubtract") {
          const newScale = model.scaling.subtract(new BABYLON.Vector3(scaleStep, scaleStep, scaleStep));
          if (newScale.x > 0.1) model.scaling = newScale;
        } else if (e.key.toLowerCase() === "r") {
          model.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(15), BABYLON.Space.LOCAL);
        } else if (e.key === "Delete" || e.key === "Escape") {
          model.dispose();
          selectedModelRef.current = null;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);


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
    const scene = sceneRef.current;
    if (!modelUrl || !scene) return;

    await new Promise(requestAnimationFrame);

    const position = getGroundIntersection(scene, scene.pointerX, scene.pointerY);
    if (!position) return;

    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync("", modelUrl, "", scene, undefined, ".glb");
      const modelRoot = new BABYLON.TransformNode("modelRoot", scene);

      result.meshes.forEach((mesh) => {
        if (mesh !== result.meshes[0]) {
          mesh.parent = modelRoot;
        }
      });

      const boundingInfo = result.meshes[0].getBoundingInfo();
      const minY = boundingInfo.boundingBox.minimumWorld.y;
      const deltaY = minY - position.y;

      modelRoot.position = new BABYLON.Vector3(position.x, position.y - deltaY, position.z);

      const dragBehavior = new BABYLON.PointerDragBehavior({ dragPlaneNormal: new BABYLON.Vector3(0, 1, 0) });
      dragBehavior.useObjectOrientationForDragging = false;
      dragBehavior.updateDragPlane = false;

      modelRoot.addBehavior(dragBehavior);
      modelRoot.dragBehavior = dragBehavior;

      dragBehavior.enabled = !isFullscreen;
    } catch (error) {
      console.error("Failed to load model:", error);
    }
  };

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const onFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);

      if (sceneRef.current) {
        sceneRef.current.meshes.forEach((mesh) => {
          if (mesh.dragBehavior) mesh.dragBehavior.enabled = !isFull;
        });
      }
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullScreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-10 p-2 bg-white rounded shadow"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
};

export default BabylonScene;