import React, {useReducer,useContext,useEffect} from "react"

import ArticlePreview from "../article/ArticlePreview";
                                
import SearchBar from "../common/SearchBar";

import { AppContext } from "../../App"

function articlesReducer(articles,{ newArticles , status , setNotification }) {
    if(!(newArticles instanceof Array)) {
        if(status) {
            return {...articles,status:'loading'}
        }
        //setNotification({ type:'error', message:'Error in retrieving the articles' })
        return({...articles,status:'error'})
    }
    if(!newArticles.length)
        return({...articles,status:'empty'})
    return({...articles,status:'success',list: newArticles})
}

async function updateArticles({searchTerm,session,articlesDispatch,API}) {
    articlesDispatch({status:'loading'})
    var newArticles = await API.getArticles({searchTerm,session})
    articlesDispatch({ newArticles })
}

function Articles() {

    const { session , API , setNotification } = useContext(AppContext)

    const [articles,articlesDispatch] = useReducer((articles,props) => {
        return articlesReducer(articles,{...props,setNotification})
    },{status:'loading'})

    useEffect(() => {
        updateArticles({searchTerm:'',session,articlesDispatch,API})
    },[])

    return(
        <div className="articles">
            <div className="search-options">
                <SearchBar
                    search={ (searchTerm)=>{updateArticles({searchTerm,session,articlesDispatch,API})} }
                ></SearchBar>
                <div className="search-status">
                    {(articles.status==='initial')?
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
                            <path d="M43.601 41.479c-.014-.015-.028-.029-.043-.043l-37-37C6.275 4.146 5.887 3.981 5.481 3.981c-.828 0-1.5.672-1.5 1.5 0 .405.164.793.455 1.076l4.417 4.417C5.836 14.473 4 19.017 4 24c0 11.046 8.954 20 20 20 4.983 0 9.527-1.835 13.025-4.854l4.411 4.411c.574.597 1.523.617 2.121.043C44.155 43.027 44.174 42.077 43.601 41.479zM24 41c-9.374 0-17-7.626-17-17 0-4.148 1.516-7.933 3.994-10.884l23.89 23.89C31.932 39.484 28.148 41 24 41zM24 7c9.374 0 17 7.626 17 17 0 3.118-.858 6.034-2.33 8.549l2.186 2.186C42.837 31.631 44 27.955 44 24c0-11.046-8.954-20-20-20-3.955 0-7.631 1.163-10.735 3.144l2.186 2.186C17.966 7.858 20.882 7 24 7z"></path>
                        </svg>
                        <div>Use the search bar to get articles</div>
                    </>
                    :(articles.status==='empty')?
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
                            <path d="M43.601 41.479c-.014-.015-.028-.029-.043-.043l-37-37C6.275 4.146 5.887 3.981 5.481 3.981c-.828 0-1.5.672-1.5 1.5 0 .405.164.793.455 1.076l4.417 4.417C5.836 14.473 4 19.017 4 24c0 11.046 8.954 20 20 20 4.983 0 9.527-1.835 13.025-4.854l4.411 4.411c.574.597 1.523.617 2.121.043C44.155 43.027 44.174 42.077 43.601 41.479zM24 41c-9.374 0-17-7.626-17-17 0-4.148 1.516-7.933 3.994-10.884l23.89 23.89C31.932 39.484 28.148 41 24 41zM24 7c9.374 0 17 7.626 17 17 0 3.118-.858 6.034-2.33 8.549l2.186 2.186C42.837 31.631 44 27.955 44 24c0-11.046-8.954-20-20-20-3.955 0-7.631 1.163-10.735 3.144l2.186 2.186C17.966 7.858 20.882 7 24 7z"></path>
                        </svg>
                        <div>Empty results</div>
                    </>
                    :(articles.status==='error')?
                    <>  
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                            <path d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
                        </svg>
                        <div>Error in retrieving</div>
                    </>
                    :(articles.status==='loading')?
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hourglass-split" viewBox="0 0 16 16">
                            <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                        </svg>
                        <div>Loading Articles</div>
                    </>
                    :<></>}
                </div>
            </div>
            <div className="search-results">
                <div className="search-meta">
                    {(articles.list instanceof Array)?"Showing "+articles.list.length+" articles":""}
                </div>
                <div className="article-previews">
                    {(articles.list instanceof Array)?
                        articles.list.map((article,idx) => {
                            return(
                                <ArticlePreview key={idx} article={article}></ArticlePreview>
                            )
                        })
                        :<></>
                    }
                </div>
            </div>
        </div>
    )
}

export default Articles