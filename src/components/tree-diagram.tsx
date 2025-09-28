"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

// Tree data structure - modify this to add/remove branches
const treeData = {
  id: "root",
  label: "Family Tree",
  children: [
    {
      id: "left-parent",
      label: "",
      children: [
        {
          id: "left-child-1",
          label: "",
          children: [
            {
              id: "grandchild-1",
              label: "",
              children: [],
            },
          ],
        },
        {
          id: "left-child-2",
          label: "",
          children: [],
        },
      ],
    },
    {
      id: "right-parent",
      label: "",
      children: [
        {
          id: "right-child-1",
          label: "",
          children: [],
        },
        {
          id: "right-child-2",
          label: "",
          children: [
            {
              id: "grandchild-2",
              label: "",
              children: [],
            },
          ],
        },
      ],
    },
  ],
}

interface TreeNode {
  id: string
  label: string
  children: TreeNode[]
}

interface NodeProps {
  node: TreeNode
  level: number
}

const TreeDiagram = () => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.3))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return // Only left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setPanStart({ x: pan.x, y: pan.y })
      e.preventDefault()
    },
    [pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const deltaX = (e.clientX - dragStart.x) / zoom
      const deltaY = (e.clientY - dragStart.y) / zoom

      setPan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY,
      })
    },
    [isDragging, dragStart, panStart, zoom],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]
        setIsDragging(true)
        setDragStart({ x: touch.clientX, y: touch.clientY })
        setPanStart({ x: pan.x, y: pan.y })
        e.preventDefault()
      }
    },
    [pan],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return

      const touch = e.touches[0]
      const deltaX = (touch.clientX - dragStart.x) / zoom
      const deltaY = (touch.clientY - dragStart.y) / zoom

      setPan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY,
      })
      e.preventDefault()
    },
    [isDragging, dragStart, panStart, zoom],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()

      // Check if it's a pinch gesture (trackpad) or regular scroll
      if (e.ctrlKey || e.metaKey) {
        // Zoom with trackpad pinch or Ctrl+scroll
        const zoomDelta = -e.deltaY * 0.01
        setZoom((prev) => Math.max(0.3, Math.min(3, prev + zoomDelta)))
      } else {
        // Pan with trackpad scroll or mouse wheel
        const deltaX = -e.deltaX / zoom
        const deltaY = -e.deltaY / zoom

        setPan((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))
      }
    },
    [zoom],
  )

  const renderNode = ({ node, level }: NodeProps) => {
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Box */}
        <div className="relative">
          <div className="w-32 h-16 border-2 border-gray-300 rounded-lg bg-transparent flex items-center justify-center text-white font-medium">
            {node.label}
          </div>

          {/* Vertical line down from node */}
          {hasChildren && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
          )}
        </div>

        {/* Children Container */}
        {hasChildren && (
          <div className="relative">
            {/* Horizontal line connecting children */}
            {node.children.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300 transform translate-y-4"></div>
            )}

            {/* Vertical lines to each child */}
            <div className="flex gap-16 pt-8">
              {node.children.map((child, index) => (
                <div key={child.id} className="relative">
                  {/* Vertical line up to horizontal connector */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>

                  {/* Recursive render of child */}
                  {renderNode({ node: child, level: level + 1 })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center text-white transition-colors"
          title="Reset View"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm">
        {Math.round(zoom * 100)}%
      </div>

      <div
        ref={containerRef}
        className={`w-full h-full flex items-center justify-center ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="min-w-max p-8">{renderNode({ node: treeData, level: 0 })}</div>
      </div>
    </div>
  )
}

export default TreeDiagram
