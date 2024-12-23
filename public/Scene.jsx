/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 scene.gltf 
Author: RandyGF (https://sketchfab.com/RandyGF)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/cloud-ring-27897026b0a24dfe992ca761a4029d01
Title: Cloud Ring
*/

import React from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

export default function Model(props) {
  const group = React.useRef()
  const { nodes, materials, animations } = useGLTF('/scene.gltf')
  const { actions } = useAnimations(animations, group)
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Cloud_GN001_2">
                <mesh name="Object_4" geometry={nodes.Object_4.geometry} material={materials.Cloud} />
              </group>
              <group name="Cloud_GN002_3" rotation={[0, -0.016, 0]}>
                <mesh name="Object_6" geometry={nodes.Object_6.geometry} material={materials.Cloud} />
              </group>
              <group name="Cloud_GN003_4" rotation={[0, -0.031, 0]}>
                <mesh name="Object_8" geometry={nodes.Object_8.geometry} material={materials.Cloud} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/scene.gltf')
