import * as React from 'react'
import { Suspense, SFC, ComponentType as CT } from 'react'
import { Switch, Route, RouteComponentProps } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/tag'
import { get } from 'lodash/fp'

import { state, Entry, EntryMap } from '../state'
import { DocRoute, loadRoute } from './DocRoute'
import { PlaygroundProps } from './Playground'

export type PageProps = RouteComponentProps<any> & {
  doc: Entry
}

export interface ComponentsMap {
  loading?: CT
  page?: CT<PageProps>
  notFound?: CT<RouteComponentProps<any>>
  playground?: CT<PlaygroundProps>
  h1?: CT<any> | string
  h2?: CT<any> | string
  h3?: CT<any> | string
  h4?: CT<any> | string
  h5?: CT<any> | string
  h6?: CT<any> | string
  span?: CT<any> | string
  a?: CT<any> | string
  ul?: CT<any> | string
  table?: CT<any> | string
  pre?: CT<any> | string
  code?: CT<any> | string
  inlineCode?: CT<any> | string
  [key: string]: any
}

const defaultComponents: ComponentsMap = {
  notFound: () => <>Not found</>,
  loading: () => <>Loading...</>,
  page: ({ children }) => <>{children}</>,
}

export interface DocPreviewProps {
  components: ComponentsMap
}

export const DocPreview: SFC<DocPreviewProps> = ({
  components: themeComponents = {},
}) => {
  const { entries } = state.use()
  if (!entries) return null

  const components = { ...defaultComponents, ...themeComponents }
  const NotFound: any = components.notFound
  const Loading: any = components.loading

  const renderRoute = (entries: EntryMap) => (path: string) => {
    const entry = get(path, entries)
    const component: any = loadRoute(path, Loading)
    const props = { entry, components, component }

    component.preload()
    return (
      <Route
        exact
        key={entry.id}
        path={entry.route}
        render={routeProps => <DocRoute {...routeProps} {...props} />}
      />
    )
  }

  return (
    <MDXProvider components={components}>
      <Suspense fallback={<Loading />}>
        <Switch>
          {Object.keys(entries).map(renderRoute(entries))}
          {NotFound && <Route component={NotFound} />}
        </Switch>
      </Suspense>
    </MDXProvider>
  )
}
