/**
 * 페이지 요청 정보 Pageable
 * @field page 요청 페이지 - 기본 값 0
 * @field size 페이지 사이즈 - 기본 값 10
 */
export class Pageable {
  page: number;
  size: number;

  constructor(page: any, size: any) {
    const parsePage = typeof page === 'string' ? parseInt(page) : 0;
    const parseSize = typeof size === 'string' ? parseInt(size) : 10;

    this.page = isNaN(parsePage) ? 0 : parsePage;
    this.size = isNaN(parseSize) ? 0 : parseSize;
  }

  getSkip() {
    return this.page * this.size;
  }

  getTake() {
    return this.size;
  }
}
