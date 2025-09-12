import { NextRequest, NextResponse } from 'next/server';
// import { aiSearchService } from '@/lib/firebase/ai';
// AI temporarily disabled: using stub below.
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { query: searchQuery, context, userId } = await request.json();

    if (!searchQuery) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // AI-enhanced search temporarily disabled
    // All results will be empty arrays for now
    const results = {
      stocks: [],
      bonds: [],
      forex: [],
      commodities: [],
      users: [],
      posts: [],
      organizations: []
    };

    // Return empty results
    return NextResponse.json({ results });

    return NextResponse.json({
      query: searchQuery,
      aiAnalysis,
      results,
      insights: searchInsights,
      totalResults: allResults.length
    });

  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const partial = searchParams.get('partial');

    if (!query && !partial) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (partial) {
      // Generate search suggestions for partial queries
      const suggestions = await aiSearchService.generateSuggestions(partial);
      return NextResponse.json({ suggestions });
    }

    // For GET requests, perform a basic search without AI enhancement
    const db = getFirestore(app);
    const results = [];

    // Basic search across multiple collections
    const collections = ['stocks', 'users', 'posts', 'organizations'];
    
    for (const collectionName of collections) {
      try {
        const q = query(
          collection(db, collectionName),
          where('name', '>=', query),
          where('name', '<=', query + '\uf8ff'),
          limit(5)
        );
        const snap = await getDocs(q);
        results.push(...snap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          collection: collectionName 
        })));
      } catch (error) {
        console.error(`Error searching ${collectionName}:`, error);
      }
    }

    return NextResponse.json({
      query,
      results,
      totalResults: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
} 