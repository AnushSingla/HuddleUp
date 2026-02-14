import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { User } from "lucide-react"
import { Button } from '@/components/ui/button' // importing Similar card contents to make UI/UX clean and not to jump after videos fetched

export const SkeletonCard = ()=> {

    return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
    {
        Array(6).fill(undefined).map((_, indx)=> (

             <div  key={indx} className="group relative"
    >

      <Card className="relative h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[30px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group-hover:-translate-y-2">

        {/* ===== THUMBNAIL AREA ===== */}
        <div
          className="relative aspect-video overflow-hidden cursor-pointer animate-pulse bg-zinc-100 dark:bg-gray-700"

        >
          {/* Category Badge (Top Left) */}
          <div className="absolute top-4 left-4 z-20">
            <span className="flex items-center dark:bg-gray-900 gap-1.5 px-12 py-3  animate-pulse rounded-xl text-[10px] font-bold border backdrop-blur-md shadow-sm">
             
            </span>
          </div>
            </div>

        {/* ===== CONTENT AREA ===== */}
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-bold rounded-xl  animate-pulse  px-5 py-3 w-24 dark:bg-gray-700 text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300 tracking-tight">  </h3>
            <p className="text-zinc-500 animate-pulse dark:bg-gray-700 text-xs h-4 w-full rounded-xl leading-relaxed"></p>
          </div>
          

          {/* Meta Info */}
          <div  className="flex  items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full  animate-pulse dark:bg-gray-700">
                
              </div>
              <span className="text-[11px]  animate-pulse rounded font-bold h-3 w-15 dark:bg-gray-700 uppercase tracking-widest"></span>
            </div>
            <div className="flex items-center  rounded text-zinc-400 dark:text-zinc-500">
              
              <span className="text-[10px]  animate-pulse dark:bg-gray-700 px-6 py-1.5 font-medium"></span>
            </div>
          </div>
        </CardContent>

        {/* ===== FOOTER ACTIONS ===== */}
        <CardFooter className="px-6 pb-6 pt-0 flex gap-3">
          <Button
          
            className="flex-[2] h-12 w-12 rounded-2xl  animate-pulse bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-extrabold text-xs uppercase tracking-wider transition-all duration-300 hover:bg-emerald-500 dark:hover:bg-emerald-400 border-none shadow-lg shadow-zinc-950/20 dark:shadow-emerald-500/10"
          >
       
          </Button>
          <Button
            variant="outline"
            size="icon"
       
            className="h-12 w-12 rounded-2xl  animate-pulse border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all"
            title="Share video"
          >
            
          </Button>
        </CardFooter>

      </Card>
    </div>
      
        ))
    }  
      </div>
        </>
     
    )
}
