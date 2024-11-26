import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FestivalDataService } from './core/data-services/festival-data.service';
import { Festival } from './core/models/festival.model';

describe('FestivalDataService', () => {
  let service: FestivalDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FestivalDataService]
    });
    service = TestBed.inject(FestivalDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve festivals data', () => {
      const mockFestivals: Festival[] = [
          {
              "name": "LOL-palooza",
              "bands": [
                  {
                      "name": "Winter Primates",
                      "recordLabel": ""
                  },
                  {
                      "name": "Frank Jupiter",
                      "recordLabel": "Pacific Records"
                  }
              ]
          }] ;

    service.getFestivalsData().subscribe((festivals: Festival[]) => {
      expect(festivals).toEqual(mockFestivals);
    });

    const req = httpMock.expectOne('/api/v1/festivals');
    expect(req.request.method).toBe('GET');
    req.flush(mockFestivals);
  });

  it('should return an array of festival objects', () => {
    const mockResponse = [
      {
        name: 'Festival 1',
        bands: [
          { name: 'Band 1', recordLabel: 'Label 1' },
          { name: 'Band 2', recordLabel: 'Label 2' },
        ],
      },
      {
        name: 'Festival 2',
        bands: [
          { name: 'Band 3', recordLabel: 'Label 3' },
        ],
      },
    ];

    service.getFestivalsData().subscribe(data => {
        expect(Array.isArray(data)).toBe(true);
        (data as any[]).forEach(festival => {
            expect(festival.name).toBeDefined();
            expect(typeof festival.name).toBe('string');
            expect(festival.bands).toBeDefined();
            expect(Array.isArray(festival.bands)).toBe(true);
        });
      });

    const req = httpMock.expectOne('/api/v1/festivals');
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });


  it('should not return a string', () => {
    const mockResponse = "";

    service.getFestivalsData().subscribe(data => {
        expect(typeof data).not.toBe('string');
      }, error => {
        // Handle error if needed
      });

    const req = httpMock.expectOne('/api/v1/festivals');
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });


  it('should handle 429 Too Many Requests error', () => {
    const mockErrorResponse = {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'retry-after': '60', // Retry after 60 seconds
      },
    };
  
    service.getFestivalsData().subscribe(
        () => fail('should have failed with the 429 error'),
        (error) => {
          expect(error.status).toBe(429);
          expect(error.statusText).toBe('Too Many Requests');
          expect(error.headers.get('retry-after')).toBe('60');
        }
      );
  
    const req = httpMock.expectOne('/api/v1/festivals');
    expect(req.request.method).toEqual('GET');
  
    req.flush(null, mockErrorResponse);
  });
});

