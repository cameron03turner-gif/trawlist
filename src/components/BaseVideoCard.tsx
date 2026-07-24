'use client'

import React from 'react'
import Link from 'next/link'
import { extractVideoId } from '@/lib/youtube'

export type BaseVideoCardProps = {
  layout?: 'grid' | 'row' | 'large-row'
  
  title: string
  channel: string | null
  channelId?: string | null
  channelThumbnail?: string | null
  thumbnail: string
  url: string
  detailUrl?: string
  
  onClick?: () => void
  
  wrapperClassName?: string
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void

  // Optional overriding elements
  topRightOverlay?: React.ReactNode // Rank number overlay
  topLeftOverlay?: React.ReactNode // Overlay on top left (if needed)
  bottomLeftOverlay?: React.ReactNode // Overlay on bottom left inside image
  hoverMenu?: React.ReactNode // Overlay on top right inside image
  
  // Slots
  leftActionSlot?: React.ReactNode // e.g. grip handle
  middleActionSlot?: React.ReactNode // e.g. ratings or status inside the details area
  rightActionSlot?: React.ReactNode // e.g. edit/delete buttons
  bottomContentSlot?: React.ReactNode // e.g. reviews, notes
  
  isInnerWrapped?: boolean // Internal flag to indicate the card is inside BaseVideoCardWrapper
}

export function BaseVideoCard(props: BaseVideoCardProps) {
  const { layout = 'grid' } = props
  const isGrid = layout === 'grid'

  const extractedId = extractVideoId(props.url)
  const effectiveDetailUrl = props.detailUrl || (extractedId ? `/videos/${extractedId}` : undefined)
  
  const thumbnailNode = (
    <div className={`relative bg-surface group/thumb shrink-0 overflow-hidden ${
      isGrid ? 'aspect-video w-full border-b border-amber/30' : 
      layout === 'large-row' ? 'border border-amber group-hover/card:border-amber transition-colors duration-300 aspect-video rounded-lg w-full sm:w-64' :
      'border border-amber group-hover/card:border-amber transition-colors duration-300 w-28 sm:w-36 aspect-video rounded-md'
    }`}>
      {props.onClick ? (
        <button onClick={props.onClick} className="absolute inset-0 w-full h-full rounded-inherit overflow-hidden cursor-pointer outline-none text-left">
          <img src={props.thumbnail} alt="" className="w-full h-full object-cover transition duration-300 group-hover/thumb:scale-105" />
        </button>
      ) : effectiveDetailUrl ? (
        <Link href={effectiveDetailUrl} className="absolute inset-0 w-full h-full rounded-inherit overflow-hidden">
          <img src={props.thumbnail} alt="" className="w-full h-full object-cover transition duration-300 group-hover/thumb:scale-105" />
        </Link>
      ) : (
        <a href={props.url} target="_blank" rel="noreferrer" className="absolute inset-0 w-full h-full rounded-inherit overflow-hidden">
          <img src={props.thumbnail} alt="" className="w-full h-full object-cover transition duration-300 group-hover/thumb:scale-105" />
        </a>
      )}
      
      {props.topRightOverlay}
      {props.topLeftOverlay}
      {props.bottomLeftOverlay}
      {props.hoverMenu}
    </div>
  )

  const textNode = (
    <div className={`flex flex-col flex-1 min-w-0 ${isGrid ? 'p-3 pt-2' : ''}`}>
      {/* Title */}
      {props.onClick ? (
        <button onClick={props.onClick} className="block text-left w-full outline-none group/title relative z-10">
          <div className={`font-medium leading-snug line-clamp-2 group-hover/title:text-amber transition ${isGrid ? 'text-sm min-h-[40px]' : layout === 'large-row' ? 'text-lg' : 'text-sm'}`} title={props.title}>
            {props.title}
          </div>
        </button>
      ) : effectiveDetailUrl ? (
        <Link href={effectiveDetailUrl} className="block group/title relative z-10">
          <div className={`font-medium leading-snug line-clamp-2 group-hover/title:text-amber transition ${isGrid ? 'text-sm min-h-[40px]' : layout === 'large-row' ? 'text-lg' : 'text-sm'}`} title={props.title}>
            {props.title}
          </div>
        </Link>
      ) : (
        <a href={props.url} target="_blank" rel="noreferrer" className="block group/title relative z-10">
          <div className={`font-medium leading-snug line-clamp-2 group-hover/title:text-amber transition ${isGrid ? 'text-sm min-h-[40px]' : layout === 'large-row' ? 'text-lg' : 'text-sm'}`} title={props.title}>
            {props.title}
          </div>
        </a>
      )}
      
      {/* Channel */}
      <div className={`flex items-center gap-2 mt-2 relative z-10`}>
        {props.channelId || props.channel ? (
          <Link href={`/channel/${encodeURIComponent(props.channelId || props.channel!)}`} className="flex items-center gap-2 group/channel min-w-0">
            {props.channelThumbnail ? (
              <img src={props.channelThumbnail} alt="" className="w-6 h-6 rounded-full object-cover border border-amber/50 shrink-0 group-hover/channel:border-amber transition-colors" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center text-amber text-[10px] font-bold shrink-0 group-hover/channel:border-amber transition-colors">
                {props.channel?.[0]?.toUpperCase() || 'C'}
              </div>
            )}
            <div className="text-muted truncate font-medium group-hover/channel:text-amber transition-colors text-sm">
              {props.channel}
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            {props.channelThumbnail ? (
              <img src={props.channelThumbnail} alt="" className="w-6 h-6 rounded-full object-cover border border-amber/50 shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center text-amber text-[10px] font-bold shrink-0">
                {props.channel?.[0]?.toUpperCase() || 'C'}
              </div>
            )}
            <div className="text-muted truncate font-medium text-sm">
              {props.channel}
            </div>
          </div>
        )}
      </div>
      
      {/* Content under title */}
      <div className={`${isGrid ? 'mt-auto pt-2' : 'mt-1'}`}>
        {props.middleActionSlot}
      </div>
    </div>
  )

  return (
    <div 
      className={`${props.isInnerWrapped ? '' : 'group/card'} relative ${
        props.isInnerWrapped 
          ? 'bg-transparent' 
          : 'bg-surface hover:brightness-110 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 overflow-hidden border border-amber'
      } ${
        isGrid ? 'flex flex-col h-full rounded-lg p-0' : 
        `flex flex-row gap-4 items-center ${props.isInnerWrapped ? 'p-0' : 'p-3 rounded-lg'}`
      } ${props.wrapperClassName || ''}`}
      draggable={props.draggable}
      onDragStart={props.onDragStart}
      onDragOver={props.onDragOver}
      onDrop={props.onDrop}
      onDragEnd={props.onDragEnd}
    >
      {/* Click overlay for card if not overridden by explicit buttons */}
      {(!props.leftActionSlot && !props.rightActionSlot && !props.isInnerWrapped) && (
        props.onClick ? (
          <button
            onClick={props.onClick}
            className="absolute inset-0 z-0 rounded-lg w-full h-full cursor-pointer focus:outline-none"
            aria-label={`View details for ${props.title}`}
          />
        ) : effectiveDetailUrl ? (
          <Link
            href={effectiveDetailUrl}
            className="absolute inset-0 z-0 rounded-lg"
            aria-label={`View details for ${props.title}`}
          />
        ) : (
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-0 rounded-lg"
            aria-label={`View ${props.title} on YouTube`}
          />
        )
      )}

      {props.leftActionSlot}
      {thumbnailNode}
      {textNode}
      {props.rightActionSlot}

      {/* Row layout doesn't use flex-col for the whole card, so bottom content breaks the flow. 
          If bottomContentSlot is provided in row mode, we should wrap the card in a flex-col. */}
    </div>
  )
}

// Wrapper to handle bottom content gracefully if present
export function BaseVideoCardWrapper(props: BaseVideoCardProps) {
  if (!props.bottomContentSlot) {
    return <BaseVideoCard {...props} />
  }

  return (
    <div className={`flex flex-col ${props.layout === 'grid' ? 'h-full' : 'relative p-3 rounded-lg bg-surface border border-amber hover:brightness-110 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 group/card'} ${props.wrapperClassName || ''}`}>
      <BaseVideoCard {...props} isInnerWrapped={true} wrapperClassName="" />
      <div className={`relative z-10 pointer-events-auto ${props.layout === 'grid' ? 'mt-2' : 'mt-3 pl-[124px] pr-12'}`}>
        {props.bottomContentSlot}
      </div>
    </div>
  )
}
