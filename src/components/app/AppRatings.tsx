import { Star } from 'lucide-react';

export function AppRatings() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-6">Ratings & Reviews</h2>
      <div className="flex gap-12 mb-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-[4rem] font-medium leading-none mb-1">4.5</div>
          <div className="text-sm text-gray-500">out of 5</div>
        </div>
        {/* Rating Bars */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-1.5">
              <div className="w-4 text-xs text-gray-500">{rating}</div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full"
                  style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Reviews */}
      <div className="space-y-6">
        {[1, 2, 3].map((review) => (
          <div key={review} className="pb-6 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Great App</span>
              <span className="text-sm text-gray-500">• 2 days ago</span>
            </div>
            <p className="text-gray-600">Sample review text for the application. This is a mock review to demonstrate the layout.</p>
          </div>
        ))}
      </div>
    </section>
  );
} 