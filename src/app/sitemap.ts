import type { MetadataRoute } from 'next'

import { getAllFightEventSlugs, getAllFighterSlugs, getAllFightSlugsForSport } from '@/lib/boxing'
import {
  getAllAuthorSlugs,
  getAllCategorySlugs,
  getAllPublishedArticleSlugs,
} from '@/lib/data'
import { getAllFootballMatchSlugs } from '@/lib/football'
import { getAllNFLGameSlugsForSport } from '@/lib/nfl'
import { getServerSideURL } from '@/lib/seo'
import {
  getAllCompetitionSlugs,
  getAllPlayerSlugs,
  getAllSportSlugs,
  getAllTeamSlugs,
} from '@/lib/sports'

const staticRoutes = [
  '',
  '/news',
  '/football',
  '/matches',
  '/nfl',
  '/nfl/games',
  '/ncaa',
  '/ncaa/games',
  '/boxing',
  '/boxing/events',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/affiliate-disclosure',
]

// Sports with their own bespoke top-level page (see the redirect map in
// src/app/(frontend)/sports/[slug]/page.tsx) are already covered by
// staticRoutes above — don't list /sports/[slug] for them too.
const PRIMARY_VERTICAL_SPORT_SLUGS = new Set(['football', 'nfl', 'ncaa-football', 'boxing'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerSideURL()

  const [
    articles,
    authors,
    categories,
    sports,
    competitions,
    teams,
    players,
    matches,
    nflGames,
    ncaaGames,
    fightEvents,
    fights,
    fighters,
  ] = await Promise.all([
    getAllPublishedArticleSlugs(),
    getAllAuthorSlugs(),
    getAllCategorySlugs(),
    getAllSportSlugs(),
    getAllCompetitionSlugs(),
    getAllTeamSlugs(),
    getAllPlayerSlugs(),
    getAllFootballMatchSlugs(),
    getAllNFLGameSlugsForSport('nfl'),
    getAllNFLGameSlugsForSport('ncaa-football'),
    getAllFightEventSlugs('boxing'),
    getAllFightSlugsForSport('boxing'),
    getAllFighterSlugs(),
  ])

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
    })),
    ...authors.map((author) => ({
      url: `${baseUrl}/authors/${author.slug}`,
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
    })),
    ...sports
      .filter((sport) => !PRIMARY_VERTICAL_SPORT_SLUGS.has(sport.slug))
      .map((sport) => ({
        url: `${baseUrl}/sports/${sport.slug}`,
      })),
    ...competitions.map((competition) => ({
      url: `${baseUrl}/competitions/${competition.slug}`,
    })),
    ...teams.map((team) => ({
      url: `${baseUrl}/teams/${team.slug}`,
    })),
    ...players.map((player) => ({
      url: `${baseUrl}/players/${player.slug}`,
    })),
    ...matches.map((match) => ({
      url: `${baseUrl}/matches/${match.slug}`,
      lastModified: match.updatedAt ? new Date(match.updatedAt) : new Date(),
    })),
    ...nflGames.map((game) => ({
      url: `${baseUrl}/nfl/games/${game.slug}`,
      lastModified: game.updatedAt ? new Date(game.updatedAt) : new Date(),
    })),
    ...ncaaGames.map((game) => ({
      url: `${baseUrl}/ncaa/games/${game.slug}`,
      lastModified: game.updatedAt ? new Date(game.updatedAt) : new Date(),
    })),
    ...fightEvents.map((event) => ({
      url: `${baseUrl}/boxing/events/${event.slug}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
    })),
    ...fights.map((fight) => ({
      url: `${baseUrl}/boxing/fights/${fight.slug}`,
      lastModified: fight.updatedAt ? new Date(fight.updatedAt) : new Date(),
    })),
    ...fighters.map((fighter) => ({
      url: `${baseUrl}/fighters/${fighter.slug}`,
    })),
  ]
}
