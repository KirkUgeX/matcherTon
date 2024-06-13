export const ROUTES = {
    LOGIN: "/",
    MAIN_PAGE: "/main",
    TEAM: "/team",
    TO_TEAM_PAGE: (queryOptions) => {
        if (queryOptions) {
            const query = new URLSearchParams(queryOptions);
            return `/team?${query}`;
        }
        return "/team";
    },
    LEADERS: {
        PAGE: "/leaders/:id",
        TO_PAGE: (contestId) => {
            return `/leaders/${contestId}`;
        },
    },
    USERS: "/users",
    PLAYERS_GAME: "/game",
    FINAL_GAME: "/final-game",
    FIRST_PLACE: "/stats/:id/first",
    TO_FIRST_PLACE: (id) => {
        return `/stats/${id}/first`;
    },
    SECOND_PLACE: "/stats/:id/second",
    TO_SECOND_PLACE: (id) => {
        return `/stats/${id}/second`;
    },
    THIRD_PLACE: "/stats/:id/third",
    TO_THIRD_PLACE: (id) => {
        return `/stats/${id}/third`;
    },
    BEST_PLAYER: "/stats/:id/best-player",
    TO_BEST_PLAYER: (id) => {
        return `/stats/${id}/best-player`;
    },
    SECOND_BEST_PLAYER: "/stats/:id/second-best-player",
    TO_SECOND_BEST_PLAYER: (contestId) => {
        return `/stats/${contestId}/second-best-player`;
    },
    THIRD_BEST_PLAYER: "/stats/:id/third-best-player",
    TO_THIRD_BEST_PLAYER: (contestId) => {
        return `/stats/${contestId}/third-best-player`;
    },
    GENERAL_STATISTICS: "/stats/:contestId/general",
    TO_GENERAL_STATISTICS: (id) => {
        return `/stats/${id}/general`;
    },
    GAME: {
        PAGE: "/play/:gameId",
        TO_PAGE: (gameId, queryOptions) => {
            if (queryOptions) {
                const query = new URLSearchParams(queryOptions);
                return `/play/${gameId}?${query}`;
            }
            return `/play/${gameId}`;
        },
    },
    CONTEST_HISTORY: {
        PAGE: "/history/:id/:teamId",
        TO_PAGE: (contestId, teamId, queryOptions) => {
            if (queryOptions) {
                const query = new URLSearchParams(queryOptions);
                return `/history/${contestId}/${teamId}?${query}`;
            }
            return `/history/${contestId}/${teamId}`;
        },
    },
};
