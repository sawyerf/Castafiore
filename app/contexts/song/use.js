import React from 'react'
import { SongContext, SongDispatchContext } from '~/contexts/song/context'

export const useSong = () => React.useContext(SongContext)
export const useSongDispatch = () => React.useContext(SongDispatchContext)
