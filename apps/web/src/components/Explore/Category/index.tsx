import MetaTags from '@components/Common/MetaTags'
import Timeline from '@components/Home/Timeline'
import TimelineShimmer from '@components/Shimmers/TimelineShimmer'
import { Loader } from '@components/UIElements/Loader'
import { NoDataFound } from '@components/UIElements/NoDataFound'
import {
  LENS_CUSTOM_FILTERS,
  LENSTUBE_APP_ID,
  LENSTUBE_BYTES_APP_ID,
  SCROLL_ROOT_MARGIN
} from '@utils/constants'
import getCategoryName from '@utils/functions/getCategoryName'
import { useRouter } from 'next/router'
import React from 'react'
import { useInView } from 'react-cool-inview'
import Custom404 from 'src/pages/404'
import {
  PublicationMainFocus,
  PublicationSortCriteria,
  PublicationTypes,
  useExploreQuery
} from 'src/types/lens'
import type { LenstubePublication } from 'src/types/local'

const ExploreCategory = () => {
  const { query } = useRouter()
  const categoryName = query.category as string

  const request = {
    publicationTypes: [PublicationTypes.Post],
    limit: 32,
    sortCriteria: PublicationSortCriteria.Latest,
    sources: [LENSTUBE_APP_ID, LENSTUBE_BYTES_APP_ID],
    customFilters: LENS_CUSTOM_FILTERS,
    metadata: {
      tags: { oneOf: [categoryName] },
      mainContentFocus: [PublicationMainFocus.Video]
    }
  }

  const { data, loading, error, fetchMore } = useExploreQuery({
    variables: {
      request
    },
    skip: !query.category
  })

  const videos = data?.explorePublications?.items as LenstubePublication[]
  const pageInfo = data?.explorePublications?.pageInfo

  const { observe } = useInView({
    rootMargin: SCROLL_ROOT_MARGIN,
    onEnter: async () => {
      await fetchMore({
        variables: {
          request: {
            cursor: pageInfo?.next,
            ...request
          }
        }
      })
    }
  })
  if (!query.category) return <Custom404 />

  return (
    <>
      <MetaTags title={categoryName?.toString() || ''} />
      <div>
        <h1 className="font-semibold capitalize md:text-2xl">
          {getCategoryName(categoryName)}
        </h1>
        <div className="my-4">
          {loading && <TimelineShimmer />}
          {videos?.length === 0 && (
            <NoDataFound isCenter withImage text="No videos found" />
          )}
          {!error && !loading && (
            <>
              <Timeline videos={videos} />
              {pageInfo?.next && videos.length !== pageInfo?.totalCount && (
                <span ref={observe} className="flex justify-center p-10">
                  <Loader />
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default ExploreCategory